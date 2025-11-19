-- Create new enums
CREATE TYPE "LeadType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'CORPORATE', 'GOVERNMENT');
CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create temporary new LeadStatus enum
CREATE TYPE "LeadStatus_new" AS ENUM ('NEW', 'KNOCKOUT_FAILED', 'MEETING_SCHEDULED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST');

-- Create temporary new LeadSource enum
CREATE TYPE "LeadSource_new" AS ENUM ('WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_CALL', 'EMAIL_CAMPAIGN', 'TRADE_SHOW', 'PARTNER', 'OTHER');

-- Add new columns with defaults first
ALTER TABLE "Lead" ADD COLUMN "firstName" TEXT;
ALTER TABLE "Lead" ADD COLUMN "middleName" TEXT;
ALTER TABLE "Lead" ADD COLUMN "lastName" TEXT;
ALTER TABLE "Lead" ADD COLUMN "contactPerson" TEXT;
ALTER TABLE "Lead" ADD COLUMN "sourceDetails" TEXT;
ALTER TABLE "Lead" ADD COLUMN "leadType" "LeadType";
ALTER TABLE "Lead" ADD COLUMN "leadPriority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "Lead" ADD COLUMN "industry" TEXT;
ALTER TABLE "Lead" ADD COLUMN "dealValue" DOUBLE PRECISION;
ALTER TABLE "Lead" ADD COLUMN "status_new" "LeadStatus_new" NOT NULL DEFAULT 'NEW';
ALTER TABLE "Lead" ADD COLUMN "source_new" "LeadSource_new" NOT NULL DEFAULT 'WEBSITE';

-- Migrate existing data: copy name to firstName
UPDATE "Lead" SET "firstName" = "name" WHERE "name" IS NOT NULL;
UPDATE "Lead" SET "firstName" = 'Unknown' WHERE "firstName" IS NULL;

-- Migrate status values
UPDATE "Lead" SET "status_new" = 'NEW' WHERE "status" = 'NEW';
UPDATE "Lead" SET "status_new" = 'KNOCKOUT_FAILED' WHERE "status" IN ('DOCUMENT_REVIEW', 'CREDIT_MODEL', 'UNDERWRITING', 'REJECTED', 'ON_HOLD');
UPDATE "Lead" SET "status_new" = 'WON' WHERE "status" = 'APPROVED';

-- Migrate source values
UPDATE "Lead" SET "source_new" = 'WEBSITE' WHERE "source" IN ('DOCUMENT_REVIEW', 'CREDIT_MODEL', 'UNDERWRITING', 'WEBSITE');
UPDATE "Lead" SET "source_new" = 'REFERRAL' WHERE "source" = 'REFERRAL';
UPDATE "Lead" SET "source_new" = 'PARTNER' WHERE "source" = 'PARTNER';

-- Drop old columns
ALTER TABLE "Lead" DROP COLUMN "name";
ALTER TABLE "Lead" DROP COLUMN "loanAmount";
ALTER TABLE "Lead" DROP COLUMN "interestRate";
ALTER TABLE "Lead" DROP COLUMN "tenure";
ALTER TABLE "Lead" DROP COLUMN "status";
ALTER TABLE "Lead" DROP COLUMN "source";

-- Rename new columns
ALTER TABLE "Lead" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Lead" RENAME COLUMN "source_new" TO "source";

-- Make firstName required
ALTER TABLE "Lead" ALTER COLUMN "firstName" SET NOT NULL;

-- Drop old enum types
DROP TYPE "LeadStatus";
DROP TYPE "LeadSource";

-- Rename new enums
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
ALTER TYPE "LeadSource_new" RENAME TO "LeadSource";

-- Create new indexes
CREATE INDEX "Lead_leadPriority_idx" ON "Lead"("leadPriority");
