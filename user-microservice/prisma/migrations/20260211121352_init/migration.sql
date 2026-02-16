-- CreateTable
CREATE TABLE "Actor" (
    "id" UUID NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL,

    CONSTRAINT "Actor_pkey" PRIMARY KEY ("id")
);
