import { Router } from "express";
import { submitVote } from "../controllers/vote.controller";
import { voteLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/", voteLimiter, submitVote);

export default router;