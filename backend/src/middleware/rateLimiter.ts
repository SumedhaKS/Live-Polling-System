import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, try again later" }
})

export const voteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { message: "Slow down!" }
})