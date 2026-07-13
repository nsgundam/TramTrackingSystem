-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "vehicle_id" VARCHAR(50);

-- CreateIndex
CREATE INDEX "feedback_vehicle_id_idx" ON "feedback"("vehicle_id");

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
