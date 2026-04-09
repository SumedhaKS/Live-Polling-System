import { Router } from "express";
import { submitVote } from "../controllers/vote.controller";

const router = Router();

router.post("/", submitVote);

export default router;