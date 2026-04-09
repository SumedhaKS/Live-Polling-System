import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createVoteSchema } from "../types/vote.types";
import { prisma } from "../db";
import { Prisma } from "../db/generated/prisma/client";
import { pollSubscribers } from "../ws/wsServer";
import { WebSocket } from "ws";

export const submitVote = async (req: Request, res: Response) => {
    let userId: string | null = null;
    let voterToken: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            userId = decoded.userId;
        }
        catch (err) {
            // expired, tampered, malformed -> userId stays null -> anonymous
        }
    }
    else {
        if (!req.body.voterToken) {
            return res.status(400).json({ message: "Voter token required" })
        }
        voterToken = req.body.voterToken;
    }

    const parsed = createVoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Bad request" });

    const { pollId, optionId } = parsed.data;
    try {
        const poll = await prisma.poll.findFirst({ where: { id: pollId, }, include: { options: true } })

        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.isActive === false) return res.status(400).json({ message: "Poll closed" });

        const validOption = poll.options.some(option => option.id === optionId)
        if (!validOption) return res.status(400).json({ message: "Invalid option" });

        if (voterToken) {
            const existingVote = await prisma.vote.findFirst({ where: { pollId, voterToken } })
            if (existingVote) {
                return res.status(400).json({ message: "Already voted" })
            }
        }

        await prisma.vote.create({
            data: {
                pollId,
                optionId,
                userId: userId ?? null,
                voterToken: voterToken ?? null
            }
        })

        const results = await prisma.option.findMany({
            where: { pollId },
            include: { _count: { select: { votes: true } } }
        })

        const subscribers = pollSubscribers.get(pollId);
        if (subscribers) {
            const payload = JSON.stringify({ type: 'vote_update', pollId, results })
            subscribers.forEach((subscriber) => {
                if (subscriber.readyState === WebSocket.OPEN) {
                    subscriber.send(payload)
                }
            })
        }

        return res.status(201).json({ message: "Vote submitted", results })
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return res.status(409).json({ message: "Already voted" })
        }
        console.error(`Error while submitting vote: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
}