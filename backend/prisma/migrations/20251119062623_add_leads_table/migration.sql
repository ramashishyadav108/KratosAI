-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'DOCUMENT_REVIEW', 'CREDIT_MODEL', 'UNDERWRITING', 'APPROVED', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('DOCUMENT_REVIEW', 'CREDIT_MODEL', 'UNDERWRITING', 'REFERRAL', 'WEBSITE', 'PARTNER');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "source" "LeadSource" NOT NULL DEFAULT 'DOCUMENT_REVIEW',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedRM" TEXT,
    "notes" TEXT,
    "loanAmount" DOUBLE PRECISION,
    "interestRate" DOUBLE PRECISION,
    "tenure" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_source_idx" ON "Lead"("source");

-- CreateIndex
CREATE INDEX "Lead_createdById_idx" ON "Lead"("createdById");

-- CreateIndex
CREATE INDEX "Lead_assignedRM_idx" ON "Lead"("assignedRM");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
