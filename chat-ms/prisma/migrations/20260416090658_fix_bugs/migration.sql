/*
  Warnings:

  - Made the column `createdById` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `requestId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "requestId" SET NOT NULL;
