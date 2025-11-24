-- CreateEnum
CREATE TYPE "ApplicantType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateTable
CREATE TABLE "CustomerBasicInfo" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "applicantType" "ApplicantType" NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT,
    "industry" TEXT,
    "country" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "businessPan" TEXT,
    "gstin" TEXT,
    "cin" TEXT,
    "udyam" TEXT,
    "contactPerson" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "keyPersonPan" TEXT,
    "keyPersonDob" TIMESTAMP(3),
    "address" TEXT,
    "registeredAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerBasicInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnershipDirector" (
    "id" TEXT NOT NULL,
    "customerBasicInfoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "designation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnershipDirector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerBasicInfo_leadId_key" ON "CustomerBasicInfo"("leadId");

-- CreateIndex
CREATE INDEX "CustomerBasicInfo_leadId_idx" ON "CustomerBasicInfo"("leadId");

-- CreateIndex
CREATE INDEX "OwnershipDirector_customerBasicInfoId_idx" ON "OwnershipDirector"("customerBasicInfoId");

-- AddForeignKey
ALTER TABLE "OwnershipDirector" ADD CONSTRAINT "OwnershipDirector_customerBasicInfoId_fkey" FOREIGN KEY ("customerBasicInfoId") REFERENCES "CustomerBasicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
