-- CreateTable
CREATE TABLE "tokenBlacklist" (
    "jti" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tokenBlacklist_jti_key" ON "tokenBlacklist"("jti");
