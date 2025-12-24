/*
  Warnings:

  - Added the required column `expectedAction` to the `AuditCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditCase" ADD COLUMN     "expectedAction" TEXT NOT NULL,
ADD COLUMN     "invoiceDetails" JSONB,
ADD COLUMN     "ledgerDetails" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "violationReason" TEXT;
