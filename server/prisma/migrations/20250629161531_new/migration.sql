-- CreateTable
CREATE TABLE "passwordHistory" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "oldPasswordHashes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passwordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passwordHistory_email_key" ON "passwordHistory"("email");
