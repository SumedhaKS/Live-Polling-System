import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)

export default router;