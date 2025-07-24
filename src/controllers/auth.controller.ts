// src/controllers/auth.controller.ts
// Prisma Client 초기화 방식 통일을 위해 getPrismaClient 사용
import { getPrismaClient } from "../services/prismaClient";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { getMessage } from "../utils/messageMapper";
import { generateToken } from "../utils/generateToken";
import { asyncHandler } from "../utils/asyncHandler";
import { getErrorMessage, getSuccessMessage } from "../utils/messageMapper";

const prisma = getPrismaClient();

const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
};

/**
 * 새로운 사용자를 등록합니다.
 * @param req HTTP 요청 객체 (username, email, password 포함)
 * @param res HTTP 응답 객체
 * @returns 등록 성공 메시지
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // 필수값 확인
    if (!username || !email || !password) {
        res.status(400).json({
            message: getErrorMessage("GLOBAL.MISSING_FIELDS", req.lang),
        });
        return;
    }

    // 비밀번호 길이 확인
    if (password.length < 8) {
        res.status(400).json({
            message: getErrorMessage("AUTH.PASSWORD_TOO_SHORT", req.lang),
        });
        return;
    }

    // 이메일 중복 확인
    const exists = await prisma.user.findUnique({
        where: { email: req.body.email },
    });
    if (exists) {
        res.status(400).json({
            message: getErrorMessage("AUTH.EMAIL_ALREADY_EXISTS", req.lang),
        });
        return;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await prisma.user.create({
        data: {
            username,
            email,
            passwordHash: hashedPassword,
        },
    });

    res.status(201).json({ message: getSuccessMessage("AUTH.REGISTER", req.lang) });
});

/**
 * 사용자를 인증하고 JWT 토큰을 발급합니다.
 * @param req HTTP 요청 객체 (email, password 포함)
 * @param res HTTP 응답 객체
 * @returns 로그인 성공 메시지와 JWT 토큰
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 필수값 확인
    if (!email || !password) {
        res.status(400).json({
            message: getErrorMessage("GLOBAL.MISSING_FIELDS", req.lang),
        });
        return;
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        res.status(401).json({
            message: getErrorMessage("AUTH.INVALID_CREDENTIALS", req.lang),
        });
        return;
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        res.status(401).json({
            message: getErrorMessage("AUTH.INVALID_CREDENTIALS", req.lang),
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
        message: getSuccessMessage("AUTH.LOGIN", req.lang),
        token,
    });
});

/**
 * 현재 인증된 사용자의 정보를 반환합니다.
 * @param req HTTP 요청 객체 (인증된 사용자 정보 포함)
 * @param res HTTP 응답 객체
 * @returns 현재 사용자 정보
 */
export const me = async (req: Request, res: Response) => {
    // authenticateToken 미들웨어에서 req.user에 사용자 정보가 추가됩니다.
    // 따라서 req.user가 존재하는지 확인하고 반환합니다.
    if (req.user) {
        res.status(200).json(req.user); // 인증된 사용자 정보 반환
    } else {
        // 미들웨어에서 이미 처리되지만, 혹시 모를 경우를 대비한 안전 장치
        res.status(401).json({
            message: getErrorMessage("AUTH.NOT_AUTHENTICATED", req.lang),
        });
    }
};

/**
 * 서버 연결 상태를 확인합니다.
 * @param req HTTP 요청 객체
 * @param res HTTP 응답 객체
 * @returns ping 응답 메시지
 */
export const ping = async (req: Request, res: Response) => {
    res.status(200).json({ message: getMessage("INFO.GLOBAL.PONG", req.lang) });
};

/**
 * 서버 헬스 체크를 수행합니다.
 * @param req HTTP 요청 객체
 * @param res HTTP 응답 객체
 * @returns 서버 상태 정보
 */
export const health = async (req: Request, res: Response) => {
    res.status(200).json(healthCheck);
};

/**
 * 사용자를 로그아웃합니다.
 * @param req HTTP 요청 객체
 * @param res HTTP 응답 객체
 * @returns 로그아웃 성공 메시지
 */
export const logout = async (req: Request, res: Response) => {
    // JWT는 서버에 세션을 저장하지 않으므로, 서버 측에서 특별히 할 일은 없습니다.
    // 클라이언트에게 토큰을 삭제하도록 지시하는 메시지를 보냅니다.
    // 이후 블랙리스트 처리나 세션 관리가 필요할 수 있지만, 현재는 간단히 메시지만 반환합니다.

    res.status(200).json({ message: getSuccessMessage("AUTH.LOGOUT", req.lang) });
};