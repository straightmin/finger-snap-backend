// src/test/prismaPing.ts
import prisma from '../lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  console.log('📦 현재 유저 수:', users.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());