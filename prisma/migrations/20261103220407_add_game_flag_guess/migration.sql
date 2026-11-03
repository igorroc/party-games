-- CreateEnum
CREATE TYPE "FlagGuessDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "FlagGuessRoundStatus" AS ENUM ('PENDING', 'SOLVED', 'SKIPPED');

-- CreateTable
CREATE TABLE "FlagGuessSession" (
    "sessionId" TEXT NOT NULL,
    "difficulty" "FlagGuessDifficulty" NOT NULL,
    "totalRounds" INTEGER NOT NULL,
    "currentRound" INTEGER NOT NULL DEFAULT 1,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlagGuessSession_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "FlagGuessRound" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "status" "FlagGuessRoundStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "FlagGuessRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlagGuessRound_sessionId_roundNumber_key" ON "FlagGuessRound"("sessionId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FlagGuessRound_sessionId_countryCode_key" ON "FlagGuessRound"("sessionId", "countryCode");

-- AddForeignKey
ALTER TABLE "FlagGuessSession" ADD CONSTRAINT "FlagGuessSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagGuessRound" ADD CONSTRAINT "FlagGuessRound_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FlagGuessSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
