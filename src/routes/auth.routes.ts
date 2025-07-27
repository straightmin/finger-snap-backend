// src/routes/auth.routes.ts
import { Router } from "express";
import {
    register,
    login,
    me,
    health,
    ping,
    logout,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateSchema, commonSchemas } from "../utils/validation";

const router = Router();
router.post("/register", validateSchema(commonSchemas.userRegister), register);
router.post("/login", validateSchema(commonSchemas.userLogin), login);
router.post("/logout", logout);
router.get("/me", authenticateToken, me); // authenticateToken 미들웨어 추가
router.get("/ping", ping);
router.get("/health", health);

export default router;
