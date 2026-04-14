/*
  Warnings:

  - A unique constraint covering the columns `[estimateCode]` on the table `CostEstimate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerCode]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceCode]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[repairCode]` on the table `RepairTicket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CostEstimate" ADD COLUMN     "estimateCode" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerCode" TEXT;

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "deviceCode" TEXT;

-- AlterTable
ALTER TABLE "RepairTicket" ADD COLUMN     "repairCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CostEstimate_estimateCode_key" ON "CostEstimate"("estimateCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceCode_key" ON "Device"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "RepairTicket_repairCode_key" ON "RepairTicket"("repairCode");
