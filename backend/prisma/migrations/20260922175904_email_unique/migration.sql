/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");
