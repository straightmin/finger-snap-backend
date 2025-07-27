import 'dotenv/config';          // ← 추가

// Prisma Client 인스턴스를 한 번만 생성해 공유하기 위한 파일입니다.
import { PrismaClient } from '@prisma/client';

// 전역 타입 선언(개발 환경에서 핫리로드 시 중복 생성 방지용)
declare global {
    var prisma: PrismaClient | undefined;
}

// 이미 전역에 있으면 재사용, 없으면 새로 생성
const prisma = global.prisma || new PrismaClient();

// 개발 모드에서는 전역 변수로 보관해 재실행 때도 재사용
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;