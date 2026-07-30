-- CreateEnum
CREATE TYPE "MagicalRaceMode" AS ENUM ('STANDARD', 'TWO_PLAYER', 'THREE_PLAYER_DOUBLE');

-- CreateTable
CREATE TABLE "MagicalRaceSession" (
    "sessionId" TEXT NOT NULL,
    "mode" "MagicalRaceMode" NOT NULL,
    "state" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MagicalRaceSession_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "MagicalRaceEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicalRaceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MagicalRaceEvent_sessionId_createdAt_idx" ON "MagicalRaceEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MagicalRaceEvent_sessionId_sequence_key" ON "MagicalRaceEvent"("sessionId", "sequence");

-- AddForeignKey
ALTER TABLE "MagicalRaceSession" ADD CONSTRAINT "MagicalRaceSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicalRaceEvent" ADD CONSTRAINT "MagicalRaceEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MagicalRaceSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
