/*
  Warnings:

  - You are about to drop the column `duration` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `planTypeId` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "duration",
DROP COLUMN "label",
DROP COLUMN "name",
ADD COLUMN     "planTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "PlanType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "PlanType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_planTypeId_fkey" FOREIGN KEY ("planTypeId") REFERENCES "PlanType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
