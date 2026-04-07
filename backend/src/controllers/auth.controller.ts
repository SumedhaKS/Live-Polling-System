import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { userSigninSchema, userSignupSchema } from "../types/user.types";

export const register = async (req: Request, res: Response) => {
    try {
        const parsed = userSignupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid inputs"
            })
        }
        const { name, email, password } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already in use"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 21)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        })

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' })

        return res.status(200).json({
            message: "User created",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    }
    catch (err) {
        console.error(`Error while creating user: ${err}`);
        return res.status(500).json("Internal server error")
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const parsed = userSigninSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid inputs"
            })
        }
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        const validUser = await bcrypt.compare(password, user.password)
        if (!validUser) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        )

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    }
    catch (err) {
        console.error(`Error while user login: ${err}`);
        return res.status(500).json({
            message: "Internal server error"
        })
    }

}