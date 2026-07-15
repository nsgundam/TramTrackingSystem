-- AlterTable
ALTER TABLE "gps_tracks" ADD COLUMN     "source_id" VARCHAR(50);

-- CreateTable
CREATE TABLE "tracking_sources" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "vehicle_id" VARCHAR(50),
    "priority" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "secret_hash" VARCHAR(255),
    "last_seen_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tracking_sources_vehicle_id_idx" ON "tracking_sources"("vehicle_id");

-- CreateIndex
CREATE INDEX "tracking_sources_status_idx" ON "tracking_sources"("status");

-- AddForeignKey
ALTER TABLE "gps_tracks" ADD CONSTRAINT "gps_tracks_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "tracking_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_sources" ADD CONSTRAINT "tracking_sources_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX unique_active_trip_per_vehicle ON trips(vehicle_id) WHERE status = 'in_progress';
