const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d", // 기본값을 7일로 설정
    });
};

module.exports = generateToken;
// 이 함수는 JWT 토큰을 생성하는 역할을 합니다.
