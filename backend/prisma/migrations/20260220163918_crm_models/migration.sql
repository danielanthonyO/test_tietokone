/*
  Warnings:

  - The `status` column on the `CostEstimate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `Customer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('WAITING_APPROVAL', 'APPROVED', 'DECLINED');

-- AlterTable
ALTER TABLE "CostEstimate" DROP COLUMN "status",
ADD COLUMN     "status" "EstimateStatus" NOT NULL DEFAULT 'WAITING_APPROVAL';

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "type",
ADD COLUMN     "type" "CustomerType" NOT NULL;

-- AlterTable
ALTER TABLE "RepairTicket" ADD COLUMN     "assignedToId" INTEGER;

-- CreateIndex
CREATE INDEX "TicketHistory_ticketId_idx" ON "TicketHistory"("ticketId");

-- AddForeignKey
ALTER TABLE "RepairTicket" ADD CONSTRAINT "RepairTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
