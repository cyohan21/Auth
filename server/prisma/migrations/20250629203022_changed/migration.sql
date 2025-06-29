/*
  Warnings:

  - You are about to drop the column `oldPasswordHashes` on the `passwordHistory` table. All the data in the column will be lost.
  - Added the required column `oldPasswordHash` to the `passwordHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "passwordHistory" DROP COLUMN "oldPasswordHashes",
ADD COLUMN     "oldPasswordHash" TEXT NOT NULL;
