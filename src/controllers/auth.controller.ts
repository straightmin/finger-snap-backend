// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { getMessage } from "../utils/messageMapper";
import { RequestHandler } from "express";
import { generateToken } from "../utils/generateToken";

const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
};

const myInfo = {
    id: 1,
    username: "straightmin",
    email: "straightmin@gmail.com",
};

// register api
export const register: RequestHandler = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    try {
        // 필수값 확인
        if (!username || !email || !password) {
            res.status(400).json({
                message: getMessage("MISSING_REQUIRED_FIELDS", lang),
            });
            return;
        }

        // 비밀번호 길이 확인
        if (password.length < 8) {
            res.status(400).json({
                message: getMessage("PASSWORD_TOO_SHORT", lang),
            });
            return;
        }

        // 이메일 중복 확인
        const exists = await prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (exists) {
            res.status(400).json({
                message: getMessage("EMAIL_ALREADY_EXISTS", lang),
            });
            return;
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
            },
        });

        res.status(201).json({ message: getMessage("SUCCESS.REGISTER", lang) });
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ errorCode: "INTERNAL_SERVER_ERROR" });
    }
};

// login api
export const login: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    try {
        // 필수값 확인
        if (!email || !password) {
            res.status(400).json({
                message: getMessage("MISSING_REQUIRED_FIELDS", lang),
            });
            return;
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({
                message: getMessage("INVALID_EMAIL_OR_PASSWORD", lang),
            });
            return;
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            res.status(401).json({
                message: getMessage("INVALID_EMAIL_OR_PASSWORD", lang),
            });
            return;
        }

        // JWT 토큰 생성
        const token = generateToken({
            userid: user.id,
            email: user.email,
            username: user.username,
        });

        res.status(200).json({
            message: getMessage("SUCCESS.LOGIN", lang),
            token,
        });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({
            errorCode: "INTERNAL_SERVER_ERROR",
        });
    }
};
export const me = (req: Request, res: Response) => {
    res.send(myInfo);
};
export const ping = (req: Request, res: Response) => {
    res.send("pong");
};
export const health = (req: Request, res: Response) => {
    res.send(healthCheck);
};
