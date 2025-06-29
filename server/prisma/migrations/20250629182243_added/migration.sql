/*
  Warnings:

  - You are about to drop the column `email` on the `passwordHistory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `passwordHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `passwordHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "passwordHistory_email_key";

-- AlterTable
ALTER TABLE "passwordHistory" DROP COLUMN "email",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "passwordHistory_userEmail_key" ON "passwordHistory"("userEmail");

-- AddForeignKey
ALTER TABLE "passwordHistory" ADD CONSTRAINT "passwordHistory_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
