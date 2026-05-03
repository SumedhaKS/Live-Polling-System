import { Request, Response } from "express";
import { createPollSchema } from "../types/poll.types";
import { prisma } from "../db";
import { Prisma } from "../db/generated/prisma/client";

export const createPoll = async (req: Request, res: Response) => {
    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Bad request" })
    }

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    try {
        const poll = await prisma.poll.create({
            data: {
                question: parsed.data.question,
                creatorId: userId,
                options: {
                    create: parsed.data.options.map((text: string, i: number) => ({
                        text,
                        order: i
                    }))
                }
            },
            include: { options: true }
        })

        return res.status(201).json({
            message: "Poll created successfully",
            poll
        })
    }
    catch (err) {
        console.error(`Error while creating poll: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getPolls = async (req: Request, res: Response) => {
    const shareCode = req.params.shareCode;
    if (!shareCode || typeof shareCode !== "string") {
        return res.status(400).json({ message: "Bad request" })
    }
    try {
        const poll = await prisma.poll.findUnique({
            where: { shareCode },
            include: {
                options: {
                    include: { _count: { select: { votes: true } } }
                }
            }
        })

        if (!poll) return res.status(404).json({ message: "Poll not found" })

        return res.status(200).json({
            message: "Fetched poll successfully",
            poll
        })
    }
    catch (err) {
        console.error(`Error while fetching poll: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deletePoll = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Bad request" })
    }
    try {
        await prisma.poll.delete({ where: { id, creatorId: req.user.userId } })
        return res.status(200).json({ message: "Poll deleted" })
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            return res.status(404).json({ message: "Poll not found or Unauthorized" })
        }
        console.error(`Error while deleting poll: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updatePoll = async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id || typeof id !== "string") return res.status(400).json({ message: "Bad request" });

    try {
        const poll = await prisma.poll.findUnique({ where: { id } });
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.creatorId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

        const updated = await prisma.poll.update({
            where: { id },
            data: { isActive: !poll.isActive }
        })
        return res.status(200).json({ message: "Poll status toggled", poll: updated })
    }
    catch (err) {
        console.error(`Error while toggling poll : ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllPolls = async (req: Request, res: Response) => {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    try {
        const polls = await prisma.poll.findMany({ where: { creatorId: userId }, include: { options: true } })
        if (polls.length === 0) {
            return res.status(404).json({ message: "No polls found", polls: [] })
        }
        return res.status(200).json({ message: "Polls fetched successfully", polls })
    }
    catch (err) {
        console.error(`Error while fetching polls: ${err}`);
        return res.status(500).json({ message: "Internal server error" })
    }
}