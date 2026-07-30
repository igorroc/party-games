-- CreateTable
CREATE TABLE "OperationalSettings" (
    "id" TEXT NOT NULL,
    "attackModeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OperationalSettings" ADD CONSTRAINT "OperationalSettings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
