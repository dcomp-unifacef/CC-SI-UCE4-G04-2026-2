/*
  Warnings:

  - The primary key for the `appointments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `patientId` column on the `appointments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `userId` column on the `audit_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `devices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `appointmentId` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `patient_devices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `patients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `createdById` column on the `reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `sale_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `patientId` column on the `sales` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `stock_movements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `appointments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `appointments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `patient_devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `patientId` on the `patient_devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `deviceId` on the `patient_devices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `patients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `patientId` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `sale_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `saleId` on the `sale_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `sale_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `sales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `sales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `stock_movements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `productId` on the `stock_movements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `stock_movements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_userId_fkey";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "patient_devices" DROP CONSTRAINT "patient_devices_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "patient_devices" DROP CONSTRAINT "patient_devices_patientId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_createdById_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_patientId_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_saleId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_patientId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_userId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_productId_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_userId_fkey";

-- AlterTable
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" UUID,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID,
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "devices" DROP CONSTRAINT "devices_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "devices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "appointmentId",
ADD COLUMN     "appointmentId" UUID,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "patient_devices" DROP CONSTRAINT "patient_devices_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" UUID NOT NULL,
DROP COLUMN "deviceId",
ADD COLUMN     "deviceId" UUID NOT NULL,
ADD CONSTRAINT "patient_devices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "patients" DROP CONSTRAINT "patients_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reports" DROP CONSTRAINT "reports_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" UUID NOT NULL,
DROP COLUMN "createdById",
ADD COLUMN     "createdById" UUID,
ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "saleId",
ADD COLUMN     "saleId" UUID NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID NOT NULL,
ADD CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sales" DROP CONSTRAINT "sales_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" UUID,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "productId",
ADD COLUMN     "productId" UUID NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_appointmentId_idx" ON "notifications"("appointmentId");

-- CreateIndex
CREATE INDEX "patient_devices_patientId_idx" ON "patient_devices"("patientId");

-- CreateIndex
CREATE INDEX "patient_devices_deviceId_idx" ON "patient_devices"("deviceId");

-- CreateIndex
CREATE INDEX "reports_patientId_idx" ON "reports"("patientId");

-- CreateIndex
CREATE INDEX "reports_createdById_idx" ON "reports"("createdById");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- CreateIndex
CREATE INDEX "sales_patientId_idx" ON "sales"("patientId");

-- CreateIndex
CREATE INDEX "sales_userId_idx" ON "sales"("userId");

-- CreateIndex
CREATE INDEX "stock_movements_productId_idx" ON "stock_movements"("productId");

-- CreateIndex
CREATE INDEX "stock_movements_userId_idx" ON "stock_movements"("userId");

-- AddForeignKey
ALTER TABLE "patient_devices" ADD CONSTRAINT "patient_devices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_devices" ADD CONSTRAINT "patient_devices_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
