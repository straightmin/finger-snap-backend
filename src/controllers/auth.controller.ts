// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { getMessage } from "../utils/messageMapper";

const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
};

const myInfo = {
    id: 1,
    username: "straightmin",
    email: "straightmin@gmail.com",
};

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

    try {
        // 필수값 확인
        if (!username || !email || !password) {
            return res
                .status(400)
                .json({ message: getMessage("MISSING_REQUIRED_FIELDS", lang) });
        }

        // 비밀번호 길이 확인
        if (password.length < 8) {
            return res
                .status(400)
                .json({ message: getMessage("PASSWORD_TOO_SHORT", lang) });
        }

        // 이메일 중복 확인
        const exists = await prisma.user.findUnique({
            where: { email: req.body.email },
        });
        if (exists) {
            return res
                .status(400)
                .json({ message: getMessage("EMAIL_ALREADY_EXISTS", lang) });
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

        return res.status(201).json({
            message: getMessage("SUCCESS.REGISTER", lang),
        });
    } catch (err) {
        console.error("Error during registration:", err);
        return res.status(500).json({ errorCode: "INTERNAL_SERVER_ERROR" });
    }
};

export const login = (req: Request, res: Response) => {
    res.send("login");
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
