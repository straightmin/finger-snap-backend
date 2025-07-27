-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notify_comments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_follows" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_likes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_series" BOOLEAN NOT NULL DEFAULT true;
