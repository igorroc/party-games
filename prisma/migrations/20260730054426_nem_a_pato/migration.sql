/*
  Warnings:

  - You are about to drop the column `categoryId` on the `GameSession` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `GameSession` table. All the data in the column will be lost.
  - You are about to drop the `GameQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GameRound` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameQuestion" DROP CONSTRAINT "GameQuestion_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "GameQuestion" DROP CONSTRAINT "GameQuestion_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameRound" DROP CONSTRAINT "GameRound_questionId_fkey";

-- DropForeignKey
ALTER TABLE "GameRound" DROP CONSTRAINT "GameRound_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "GameSession" DROP CONSTRAINT "GameSession_categoryId_fkey";

-- AlterTable
ALTER TABLE "GameSession" DROP COLUMN "categoryId",
DROP COLUMN "difficulty";

-- DropTable
DROP TABLE "GameQuestion";

-- DropTable
DROP TABLE "GameRound";

-- DropTable
DROP TABLE "QuestionCategory";

-- CreateTable
CREATE TABLE "NemAPatoCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NemAPatoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NemAPatoQuestion" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "answerValue" DECIMAL(65,30),
    "answerText" TEXT NOT NULL,
    "answerUnit" TEXT,
    "explanation" TEXT,
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "difficulty" "QuestionDifficulty" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'pt-BR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NemAPatoQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NemAPatoSession" (
    "sessionId" TEXT NOT NULL,
    "categoryId" TEXT,
    "difficulty" "QuestionDifficulty",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NemAPatoSession_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "NemAPatoRound" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "revealedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NemAPatoRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NemAPatoCategory_slug_key" ON "NemAPatoCategory"("slug");

-- CreateIndex
CREATE INDEX "NemAPatoQuestion_isActive_isReviewed_idx" ON "NemAPatoQuestion"("isActive", "isReviewed");

-- CreateIndex
CREATE INDEX "NemAPatoQuestion_categoryId_difficulty_idx" ON "NemAPatoQuestion"("categoryId", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "NemAPatoQuestion_prompt_key" ON "NemAPatoQuestion"("prompt");

-- CreateIndex
CREATE INDEX "NemAPatoSession_categoryId_idx" ON "NemAPatoSession"("categoryId");

-- CreateIndex
CREATE INDEX "NemAPatoRound_sessionId_idx" ON "NemAPatoRound"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "NemAPatoRound_sessionId_roundNumber_key" ON "NemAPatoRound"("sessionId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NemAPatoRound_sessionId_questionId_key" ON "NemAPatoRound"("sessionId", "questionId");

-- AddForeignKey
ALTER TABLE "NemAPatoQuestion" ADD CONSTRAINT "NemAPatoQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NemAPatoCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NemAPatoSession" ADD CONSTRAINT "NemAPatoSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NemAPatoSession" ADD CONSTRAINT "NemAPatoSession_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NemAPatoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NemAPatoRound" ADD CONSTRAINT "NemAPatoRound_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "NemAPatoSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NemAPatoRound" ADD CONSTRAINT "NemAPatoRound_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "NemAPatoQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
