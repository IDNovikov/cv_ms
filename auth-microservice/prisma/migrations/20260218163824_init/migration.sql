-- CreateEnum
CREATE TYPE "userRoles" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "userStatus" AS ENUM ('ACTIVE', 'BANNED', 'DELETED');

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "userRoles" NOT NULL DEFAULT 'USER',
    "status" "userStatus" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE INDEX "Auth_status_idx" ON "Auth"("status");

-- CreateIndex
CREATE INDEX "Auth_role_idx" ON "Auth"("role");
