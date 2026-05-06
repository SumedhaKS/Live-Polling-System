import z from "zod";

export const createPollSchema = z.object({
    question: z.string().min(1, "Question cannot be empty"),
    options: z.string().array().min(2, "At least 2 options required"),
    expiresAt: z.iso.datetime().optional().nullable()
  })