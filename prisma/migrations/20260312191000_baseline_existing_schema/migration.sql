-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."MembershipStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgNumber" TEXT,
    "status" "public"."CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompanyMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "role" "public"."MemberRole" NOT NULL DEFAULT 'USER',
    "status" "public"."MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MembershipRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "status" "public"."MembershipStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "public"."Company"("name" ASC);

-- CreateIndex
CREATE INDEX "Company_orgNumber_idx" ON "public"."Company"("orgNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Company_orgNumber_key" ON "public"."Company"("orgNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_companyId_shopifyCustomerId_key" ON "public"."CompanyMember"("companyId" ASC, "shopifyCustomerId" ASC);

-- CreateIndex
CREATE INDEX "CompanyMember_shopifyCustomerId_idx" ON "public"."CompanyMember"("shopifyCustomerId" ASC);

-- CreateIndex
CREATE INDEX "CompanyMember_status_idx" ON "public"."CompanyMember"("status" ASC);

-- CreateIndex
CREATE INDEX "MembershipRequest_companyId_status_idx" ON "public"."MembershipRequest"("companyId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "MembershipRequest_shopifyCustomerId_idx" ON "public"."MembershipRequest"("shopifyCustomerId" ASC);

-- CreateIndex
CREATE INDEX "Session_shop_idx" ON "public"."Session"("shop" ASC);

-- AddForeignKey
ALTER TABLE "public"."CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MembershipRequest" ADD CONSTRAINT "MembershipRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

