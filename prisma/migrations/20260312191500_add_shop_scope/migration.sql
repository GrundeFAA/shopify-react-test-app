-- DropIndex
DROP INDEX "CompanyMember_companyId_shopifyCustomerId_key";

-- DropIndex
DROP INDEX "CompanyMember_shopifyCustomerId_idx";

-- DropIndex
DROP INDEX "MembershipRequest_shopifyCustomerId_idx";

-- AlterTable
ALTER TABLE "CompanyMember" ADD COLUMN     "shop" TEXT;

-- AlterTable
ALTER TABLE "MembershipRequest" ADD COLUMN     "shop" TEXT;

-- Backfill existing rows to a safe legacy scope.
UPDATE "CompanyMember"
SET "shop" = 'legacy-shop'
WHERE "shop" IS NULL;

UPDATE "MembershipRequest"
SET "shop" = 'legacy-shop'
WHERE "shop" IS NULL;

-- Enforce required shop scope after backfill.
ALTER TABLE "CompanyMember" ALTER COLUMN "shop" SET NOT NULL;
ALTER TABLE "MembershipRequest" ALTER COLUMN "shop" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CompanyMember_shop_shopifyCustomerId_idx" ON "CompanyMember"("shop", "shopifyCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_shop_companyId_shopifyCustomerId_key" ON "CompanyMember"("shop", "companyId", "shopifyCustomerId");

-- CreateIndex
CREATE INDEX "MembershipRequest_shop_shopifyCustomerId_idx" ON "MembershipRequest"("shop", "shopifyCustomerId");

