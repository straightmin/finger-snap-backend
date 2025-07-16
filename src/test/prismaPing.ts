// src/test/prismaPing.ts
// Prisma Client 초기화 방식 통일을 위해 getPrismaClient 사용
import { getPrismaClient } from '../services/prismaClient';

const prisma = getPrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('📦 현재 유저 수:', users.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());