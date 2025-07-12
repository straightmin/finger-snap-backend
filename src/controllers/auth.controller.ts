// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { getMessage } from "../utils/messageMapper";
import { generateToken } from "../utils/generateToken";
import { asyncHandler } from "../utils/asyncHandler";

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
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

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
});

// login api
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";

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
});

// get my info api
export const me = async (req: Request, res: Response) => {
    // authenticateToken 미들웨어에서 req.user에 사용자 정보가 추가됩니다.
    // 따라서 req.user가 존재하는지 확인하고 반환합니다.

    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";
    if (req.user) {
        res.status(200).json(req.user); // 인증된 사용자 정보 반환
    } else {
        // 미들웨어에서 이미 처리되지만, 혹시 모를 경우를 대비한 안전 장치
        res.status(401).json({
            message: getMessage("NOT_AUTHENTICATED", lang),
        });
    }
};
export const ping = async (req: Request, res: Response) => {
    res.status(200).json({ message: "pong" });
};
export const health = async (req: Request, res: Response) => {
    res.status(200).json(healthCheck);
};

// logout api
export const logout = async (req: Request, res: Response) => {
    // JWT는 서버에 세션을 저장하지 않으므로, 서버 측에서 특별히 할 일은 없습니다.
    // 클라이언트에게 토큰을 삭제하도록 지시하는 메시지를 보냅니다.
    // 이후 블랙리스트 처리나 세션 관리가 필요할 수 있지만, 현재는 간단히 메시지만 반환합니다.
    const lang = req.headers["accept-language"] === "en" ? "en" : "ko";
    res.status(200).json({ message: getMessage("SUCCESS.LOGOUT", lang) });
};