import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

/**
 * Prisma 클라이언트 인스턴스를 반환합니다. 싱글톤 패턴을 사용합니다.
 * @returns Prisma 클라이언트 인스턴스
 */
export const getPrismaClient = () => {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
};
