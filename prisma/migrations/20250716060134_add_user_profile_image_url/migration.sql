/*
  Warnings:

  - You are about to drop the `follows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_followingId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image_url" TEXT;

-- DropTable
DROP TABLE "follows";
