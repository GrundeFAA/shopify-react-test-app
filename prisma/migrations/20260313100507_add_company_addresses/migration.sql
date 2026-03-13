-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING');

-- CreateTable
CREATE TABLE "CompanyAddress" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL,
    "label" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyAddressMember" (
    "id" TEXT NOT NULL,
    "companyAddressId" TEXT NOT NULL,
    "shopifyCustomerId" TEXT NOT NULL,
    "shopifyAddressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAddressMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyAddress_companyId_type_idx" ON "CompanyAddress"("companyId", "type");

-- CreateIndex
CREATE INDEX "CompanyAddressMember_shopifyCustomerId_idx" ON "CompanyAddressMember"("shopifyCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAddressMember_companyAddressId_shopifyCustomerId_key" ON "CompanyAddressMember"("companyAddressId", "shopifyCustomerId");

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAddressMember" ADD CONSTRAINT "CompanyAddressMember_companyAddressId_fkey" FOREIGN KEY ("companyAddressId") REFERENCES "CompanyAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
