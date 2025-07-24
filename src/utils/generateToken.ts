import jwt from "jsonwebtoken";
import config from "../config";

/**
 * JWT 토큰을 생성합니다.
 * @param payload 토큰에 포함할 데이터
 * @returns 생성된 JWT 토큰 문자열
 */
export const generateToken = (payload: object) => {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "7d" });
};
