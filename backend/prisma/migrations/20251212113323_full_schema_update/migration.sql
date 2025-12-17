/*
  Warnings:

  - You are about to drop the column `description` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `earnedAt` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Badge` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activityType` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xpEarned` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xpRequirement` to the `Badge` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `difficulty` on the `CaseLaw` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_userId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "description",
DROP COLUMN "type",
ADD COLUMN     "activityId" TEXT NOT NULL,
ADD COLUMN     "activityType" TEXT NOT NULL,
ADD COLUMN     "answers" JSONB,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "timeTaken" INTEGER,
ADD COLUMN     "xpEarned" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "earnedAt",
DROP COLUMN "userId",
ADD COLUMN     "xpRequirement" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CaseLaw" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
ALTER COLUMN "xpReward" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "lastActivityDate" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "preferredAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'student';

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- AddForeignKey
ALTER TABLE "CaseLaw" ADD CONSTRAINT "CaseLaw_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
