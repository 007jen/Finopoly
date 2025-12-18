/*
  Warnings:

  - Changed the type of `activityType` on the `Activity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('audit', 'tax', 'caselaw', 'quiz');

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "activityType",
ADD COLUMN     "activityType" "ActivityType" NOT NULL;

-- CreateTable
CREATE TABLE "CaseSubmission" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseSubmission_caseId_idx" ON "CaseSubmission"("caseId");

-- CreateIndex
CREATE INDEX "CaseSubmission_userId_idx" ON "CaseSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseSubmission_caseId_userId_key" ON "CaseSubmission"("caseId", "userId");

-- AddForeignKey
ALTER TABLE "CaseSubmission" ADD CONSTRAINT "CaseSubmission_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseLaw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseSubmission" ADD CONSTRAINT "CaseSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
