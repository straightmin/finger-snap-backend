// src/middlewares/auth.middleware.ts
// Prisma Client 초기화 방식 통일을 위해 getPrismaClient 사용
import { getPrismaClient } from "../services/prismaClient";
import { Request, Response, RequestHandler, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { getErrorMessage } from "../utils/messageMapper"; // 메시지 매퍼 임포트
import config from '../config';

const prisma = getPrismaClient();

// Request 객체에 user 속성을 추가하기 위한 타입 확장
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                username: string;
            };
        }
    }
}

// JWT 검증 미들웨어
export const authenticateToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Authorization 헤더에서 토큰 추출
    // 헤더 형식: Bearer <token>
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // 'Bearer ' 부분을 제외한 토큰 값

    // 2. 토큰이 없는 경우 401 Unauthorized 응답
    if (token == null) {
        res.status(401).json({ message: getErrorMessage("AUTH.AUTHENTICATION_TOKEN_REQUIRED", req.lang) });
        return;
    }

    try {
        // 3. JWT 토큰 검증
        const decoded = jwt.verify(token, config.JWT_SECRET) as {
            userid: number;
            email: string;
            username: string;
        };

        // 4. 디코딩된 사용자 ID로 데이터베이스에서 사용자 정보 조회
        // 토큰에 있는 정보가 최신이 아닐 수 있으므로 DB에서 다시 조회하는 것이 안전합니다.
        const user = await prisma.user.findUnique({
            where: { id: decoded.userid },
            select: { id: true, email: true, username: true }, // 비밀번호 해시 등 민감 정보는 제외
        });

        // 5. 사용자 정보가 없는 경우 403 Forbidden 응답 (유효하지 않은 토큰 또는 사용자 삭제)
        if (!user) {
            res.status(403).json({ message: getErrorMessage("AUTH.INVALID_TOKEN_OR_USER_NOT_FOUND", req.lang) });
            return;
        }

        // 6. Request 객체에 사용자 정보 추가
        // 이렇게 추가된 정보는 다음 미들웨어 또는 라우트 핸들러에서 req.user로 접근할 수 있습니다.
        req.user = user;

        // 7. 다음 미들웨어 또는 라우트 핸들러로 제어 전달
        next();
    } catch (err) {
        // 8. 토큰 검증 실패 (만료, 위조 등) 시 403 Forbidden 응답
        console.error("JWT verification error:", err);
        res.status(403).json({ message: getErrorMessage("AUTH.INVALID_TOKEN_OR_USER_NOT_FOUND", req.lang) });
        return;
    }
};
