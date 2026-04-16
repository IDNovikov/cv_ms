-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "ChatMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('TEXT', 'SYSTEM');

-- CreateTable
CREATE TABLE "Chat" (
    "id" UUID NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "ChatType" NOT NULL,
    "title" TEXT,
    "avatarUrl" TEXT,
    "directKey" TEXT,
    "createdById" TEXT,
    "lastMessageId" UUID,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMember" (
    "requestId" TEXT NOT NULL,
    "id" UUID NOT NULL,
    "chatId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "mutedUntil" TIMESTAMP(3),
    "lastReadMessageId" UUID,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "requestId" TEXT,
    "id" UUID NOT NULL,
    "chatId" UUID NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" "MessageKind" NOT NULL DEFAULT 'TEXT',
    "text" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "replyToId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_directKey_key" ON "Chat"("directKey");

-- CreateIndex
CREATE INDEX "Chat_type_idx" ON "Chat"("type");

-- CreateIndex
CREATE INDEX "Chat_lastMessageAt_idx" ON "Chat"("lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "Chat_createdById_idx" ON "Chat"("createdById");

-- CreateIndex
CREATE INDEX "ChatMember_chatId_leftAt_idx" ON "ChatMember"("chatId", "leftAt");

-- CreateIndex
CREATE INDEX "ChatMember_archivedAt_idx" ON "ChatMember"("archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMember_chatId_userId_key" ON "ChatMember"("chatId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_requestId_key" ON "Message"("requestId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_authorId_createdAt_idx" ON "Message"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId");

-- CreateIndex
CREATE INDEX "Message_chatId_deletedAt_createdAt_idx" ON "Message"("chatId", "deletedAt", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
