-- AlterTable
ALTER TABLE "tokenBlacklist" ADD CONSTRAINT "tokenBlacklist_pkey" PRIMARY KEY ("jti");

-- DropIndex
DROP INDEX "tokenBlacklist_jti_key";
