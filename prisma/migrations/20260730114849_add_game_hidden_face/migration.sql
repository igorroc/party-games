-- CreateTable
CREATE TABLE "HiddenFaceSession" (
    "sessionId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiddenFaceSession_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "HiddenFaceEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenFaceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HiddenFaceEvent_sessionId_createdAt_idx" ON "HiddenFaceEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenFaceEvent_sessionId_sequence_key" ON "HiddenFaceEvent"("sessionId", "sequence");

-- AddForeignKey
ALTER TABLE "HiddenFaceSession" ADD CONSTRAINT "HiddenFaceSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenFaceEvent" ADD CONSTRAINT "HiddenFaceEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "HiddenFaceSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
