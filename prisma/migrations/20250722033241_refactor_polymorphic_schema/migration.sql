/*
  Warnings:

  - You are about to drop the column `content` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `resource_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `resource_type` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the `comment_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `photo_likes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[like_id]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[follow_id]` on the table `notifications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actor_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_photo_id_fkey";

-- DropForeignKey
ALTER TABLE "photo_likes" DROP CONSTRAINT "photo_likes_photo_id_fkey";

-- DropForeignKey
ALTER TABLE "photo_likes" DROP CONSTRAINT "photo_likes_user_id_fkey";

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "series_id" INTEGER,
ALTER COLUMN "photo_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "content",
DROP COLUMN "resource_id",
DROP COLUMN "resource_type",
ADD COLUMN     "actor_id" INTEGER NOT NULL,
ADD COLUMN     "comment_id" INTEGER,
ADD COLUMN     "event_type" TEXT NOT NULL,
ADD COLUMN     "follow_id" INTEGER,
ADD COLUMN     "like_id" INTEGER,
ADD COLUMN     "photo_id" INTEGER,
ADD COLUMN     "series_id" INTEGER;

-- DropTable
DROP TABLE "comment_likes";

-- DropTable
DROP TABLE "photo_likes";

-- CreateTable
CREATE TABLE "follows" (
    "id" SERIAL NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo_id" INTEGER,
    "series_id" INTEGER,
    "comment_id" INTEGER,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_photo_id_key" ON "likes"("user_id", "photo_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_series_id_key" ON "likes"("user_id", "series_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_comment_id_key" ON "likes"("user_id", "comment_id");

-- CreateIndex
CREATE INDEX "comments_series_id_idx" ON "comments"("series_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_like_id_key" ON "notifications"("like_id");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_follow_id_key" ON "notifications"("follow_id");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_like_id_fkey" FOREIGN KEY ("like_id") REFERENCES "likes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_follow_id_fkey" FOREIGN KEY ("follow_id") REFERENCES "follows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
