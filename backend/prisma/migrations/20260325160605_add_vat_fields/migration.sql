/*
  Warnings:

  - Added the required column `subtotal` to the `CostEstimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatAmount` to the `CostEstimate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CostEstimate" ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vatAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.255,
ALTER COLUMN "totalCost" SET DATA TYPE DOUBLE PRECISION;
