import { Router } from "express";
import {
    register,
    login,
    me,
    health,
    ping,
} from "../controllers/auth.controller";

console.log("DEBUG handlers:", { register, login, me, health, ping }); // ← import "뒤"

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.get("/ping", ping);
router.get("/health", health);

export default router;
