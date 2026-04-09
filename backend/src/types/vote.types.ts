import z from "zod";

export const createVoteSchema = z.object({
    pollId: z.string(),
    optionId: z.string(),
    voterToken: z.string().optional()
})