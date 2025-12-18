-- AlterTable
ALTER TABLE "CaseSubmission" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
