-- CreateEnum
CREATE TYPE "FlagGuessMode" AS ENUM ('GUESS', 'REVEAL');

-- AlterEnum
ALTER TYPE "FlagGuessRoundStatus" ADD VALUE 'REVEALED';

-- AlterTable
ALTER TABLE "FlagGuessSession" ADD COLUMN     "mode" "FlagGuessMode" NOT NULL DEFAULT 'GUESS';
