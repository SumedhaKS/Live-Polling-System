import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createPoll, deletePoll, getPolls, updatePoll } from "../controllers/poll.controller";

const router = Router();

router.post("/", authMiddleware, createPoll)
router.get("/:shareCode", getPolls)
router.delete("/:id", authMiddleware, deletePoll)
router.patch("/:id/toggle", authMiddleware, updatePoll)

export default router;