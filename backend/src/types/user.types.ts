import z from "zod";

export const userSignupSchema = z.object({
    name: z.string().optional(),
    email: z.email(),
    password: z.string().min(4).max(15)
})

export const userSigninSchema = z.object({
    email: z.email(),
    password: z.string().min(4).max(15)
})