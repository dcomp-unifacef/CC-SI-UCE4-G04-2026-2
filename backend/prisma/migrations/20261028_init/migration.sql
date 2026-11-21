-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('WASHABLE', 'DISPOSABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReportPlatform" AS ENUM ('AIRVIEW', 'CARE_ORCHESTRATOR', 'SMART_LIVE', 'MANUAL');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('AWAITING_MATCH', 'PROCESSING', 'REVIEW_REQUIRED', 'APPROVED', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportMatchStatus" AS ENUM ('MATCHED', 'REVIEW_REQUIRED', 'UNMATCHED', 'MANUAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('POLYSOMNOGRAPHY', 'OTHER');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('FILTER_WASH', 'FILTER_REPLACE_DISPOSABLE', 'FILTER_REPLACE_WASHABLE', 'ANNUAL_MAINTENANCE', 'MONTHLY_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SCHEDULED', 'PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('WHATSAPP');

-- CreateEnum
CREATE TYPE "AutomationJobType" AS ENUM ('MESSAGE_SEND', 'REPORT_IMPORT', 'REPORT_PROCESS', 'REPORT_SEND', 'PORTAL_SYNC');

-- CreateEnum
CREATE TYPE "AutomationJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "username" VARCHAR(60),
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "ipAddress" VARCHAR(64),
    "userAgent" VARCHAR(512),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(180) NOT NULL,
    "phone" VARCHAR(32) NOT NULL,
    "birthDate" DATE,
    "therapyStartDate" DATE,
    "cpf" VARCHAR(14),
    "cep" VARCHAR(9),
    "email" VARCHAR(320),
    "cpapSerialNumber" VARCHAR(120),
    "cpapModelId" UUID,
    "cpapModelName" VARCHAR(160),
    "filterType" "FilterType",
    "physicianName" VARCHAR(180),
    "maskModel" VARCHAR(160),
    "reportPlatform" "ReportPlatform",
    "status" "PatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
    "whatsappOptOutAt" TIMESTAMP(3),
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CpapModel" (
    "id" UUID NOT NULL,
    "manufacturer" VARCHAR(120) NOT NULL,
    "model" VARCHAR(160) NOT NULL,
    "filterType" "FilterType" NOT NULL DEFAULT 'UNKNOWN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CpapModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'POLYSOMNOGRAPHY',
    "originalName" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "uploadedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientReport" (
    "id" UUID NOT NULL,
    "patientId" UUID,
    "platform" "ReportPlatform" NOT NULL,
    "periodStart" DATE,
    "periodEnd" DATE,
    "status" "ReportStatus" NOT NULL DEFAULT 'AWAITING_MATCH',
    "matchStatus" "ReportMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "originalName" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "uploadedById" UUID,
    "matchIdentifier" VARCHAR(180),
    "extractedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" UUID,
    "failureReason" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportMetric" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" DECIMAL(14,4),
    "valueText" VARCHAR(255),
    "unit" VARCHAR(80),
    "sourceLabel" VARCHAR(180),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "filterType" "FilterType",
    "body" TEXT NOT NULL,
    "mediaUrl" VARCHAR(2000),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "reportId" UUID,
    "templateId" UUID,
    "channel" "MessageChannel" NOT NULL DEFAULT 'WHATSAPP',
    "category" "TemplateCategory" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'SCHEDULED',
    "contentSnapshot" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "providerMessageId" VARCHAR(180),
    "idempotencyKey" VARCHAR(180),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "errorCode" VARCHAR(120),
    "errorMessage" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationJob" (
    "id" UUID NOT NULL,
    "type" "AutomationJobType" NOT NULL,
    "status" "AutomationJobStatus" NOT NULL DEFAULT 'QUEUED',
    "patientId" UUID,
    "reportId" UUID,
    "messageLogId" UUID,
    "payload" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorCode" VARCHAR(120),
    "errorMessage" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" VARCHAR(40) NOT NULL DEFAULT 'global',
    "timezone" VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo',
    "sendingWindowStart" VARCHAR(5) NOT NULL DEFAULT '09:00',
    "sendingWindowEnd" VARCHAR(5) NOT NULL DEFAULT '18:00',
    "messageAutomationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reportAutomationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalSetting" (
    "id" UUID NOT NULL,
    "platform" "ReportPlatform" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" VARCHAR(120),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "patientId" UUID,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_isActive_role_idx" ON "User"("isActive", "role");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_refreshTokenHash_key" ON "AuthSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_revokedAt_idx" ON "AuthSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cpf_key" ON "Patient"("cpf");

-- CreateIndex
CREATE INDEX "Patient_fullName_idx" ON "Patient"("fullName");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_cpapSerialNumber_idx" ON "Patient"("cpapSerialNumber");

-- CreateIndex
CREATE INDEX "Patient_status_therapyStartDate_idx" ON "Patient"("status", "therapyStartDate");

-- CreateIndex
CREATE INDEX "Patient_cpapModelId_filterType_idx" ON "Patient"("cpapModelId", "filterType");

-- CreateIndex
CREATE INDEX "Patient_reportPlatform_idx" ON "Patient"("reportPlatform");

-- CreateIndex
CREATE INDEX "CpapModel_isActive_filterType_idx" ON "CpapModel"("isActive", "filterType");

-- CreateIndex
CREATE UNIQUE INDEX "CpapModel_manufacturer_model_key" ON "CpapModel"("manufacturer", "model");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDocument_storageKey_key" ON "PatientDocument"("storageKey");

-- CreateIndex
CREATE INDEX "PatientDocument_patientId_createdAt_idx" ON "PatientDocument"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "PatientDocument_sha256_idx" ON "PatientDocument"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "PatientReport_storageKey_key" ON "PatientReport"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "PatientReport_sha256_key" ON "PatientReport"("sha256");

-- CreateIndex
CREATE INDEX "PatientReport_patientId_periodStart_periodEnd_idx" ON "PatientReport"("patientId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "PatientReport_status_createdAt_idx" ON "PatientReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PatientReport_platform_periodStart_idx" ON "PatientReport"("platform", "periodStart");

-- CreateIndex
CREATE INDEX "PatientReport_matchStatus_idx" ON "PatientReport"("matchStatus");

-- CreateIndex
CREATE INDEX "ReportMetric_key_idx" ON "ReportMetric"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ReportMetric_reportId_key_key" ON "ReportMetric"("reportId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_code_key" ON "MessageTemplate"("code");

-- CreateIndex
CREATE INDEX "MessageTemplate_category_filterType_isActive_idx" ON "MessageTemplate"("category", "filterType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MessageLog_idempotencyKey_key" ON "MessageLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "MessageLog_patientId_createdAt_idx" ON "MessageLog"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageLog_status_scheduledAt_idx" ON "MessageLog"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "MessageLog_category_status_idx" ON "MessageLog"("category", "status");

-- CreateIndex
CREATE INDEX "AutomationJob_status_scheduledAt_idx" ON "AutomationJob"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "AutomationJob_type_createdAt_idx" ON "AutomationJob"("type", "createdAt");

-- CreateIndex
CREATE INDEX "AutomationJob_patientId_createdAt_idx" ON "AutomationJob"("patientId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortalSetting_platform_key" ON "PortalSetting"("platform");

-- CreateIndex
CREATE INDEX "AuditLog_patientId_createdAt_idx" ON "AuditLog"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_cpapModelId_fkey" FOREIGN KEY ("cpapModelId") REFERENCES "CpapModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientReport" ADD CONSTRAINT "PatientReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientReport" ADD CONSTRAINT "PatientReport_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportMetric" ADD CONSTRAINT "ReportMetric_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PatientReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PatientReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageLog" ADD CONSTRAINT "MessageLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationJob" ADD CONSTRAINT "AutomationJob_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationJob" ADD CONSTRAINT "AutomationJob_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "PatientReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationJob" ADD CONSTRAINT "AutomationJob_messageLogId_fkey" FOREIGN KEY ("messageLogId") REFERENCES "MessageLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
