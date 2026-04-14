/*
  Warnings:

  - The values [WAITING_APPROVAL,DECLINED] on the enum `EstimateStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amount` on the `CostEstimate` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `CostEstimate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[approvalToken]` on the table `CostEstimate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `laborCost` to the `CostEstimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partsCost` to the `CostEstimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `CostEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstimateStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');
ALTER TABLE "public"."CostEstimate" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CostEstimate" ALTER COLUMN "status" TYPE "EstimateStatus_new" USING ("status"::text::"EstimateStatus_new");
ALTER TYPE "EstimateStatus" RENAME TO "EstimateStatus_old";
ALTER TYPE "EstimateStatus_new" RENAME TO "EstimateStatus";
DROP TYPE "public"."EstimateStatus_old";
ALTER TABLE "CostEstimate" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "CostEstimate_token_key";

-- AlterTable
ALTER TABLE "CostEstimate" DROP COLUMN "amount",
DROP COLUMN "token",
ADD COLUMN     "approvalToken" TEXT,
ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "laborCost" INTEGER NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "partsCost" INTEGER NOT NULL,
ADD COLUMN     "totalCost" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "CostEstimate_approvalToken_key" ON "CostEstimate"("approvalToken");
