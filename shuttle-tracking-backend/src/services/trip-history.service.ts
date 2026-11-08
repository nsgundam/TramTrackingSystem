import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { notFound } from '../middleware/boundary-errors.js';
import {
  TRACKING_SOURCE_TYPES,
  type BoundedPaginationInput,
  type TrackingSourceType,
  type TripHistoryListInput,
} from '../middleware/validation.js';

export const TRIP_HISTORY_TRACK_SEMANTICS = 'sampled_canonical' as const;
export const TRIP_HISTORY_COMPLETENESS = 'sampled_not_ground_truth' as const;

const tripMetadataSelect = {
  id: true,
  vehicleId: true,
  routeId: true,
  status: true,
  startTime: true,
  endTime: true,
  lastTripActivityAt: true,
  closedAt: true,
  endReason: true,
  createdAt: true,
  vehicle: { select: { id: true, name: true, type: true } },
  route: { select: { id: true, name: true, color: true } },
  _count: { select: { gpsTracks: true } },
} as const;

export type TripHistoryMetadataRecord = Prisma.TripGetPayload<{ select: typeof tripMetadataSelect }>;

export interface CanonicalTrackPoint {
  id: string;
  recordedAt: Date;
  lat: number | null;
  lng: number | null;
  speed: string | null;
  heading: string | null;
  station: string | null;
  sourceId: string | null;
}

export const buildTripHistoryWhere = (input: TripHistoryListInput): Prisma.TripWhereInput => ({
  ...(input.vehicleId === undefined ? {} : { vehicleId: input.vehicleId }),
  ...(input.routeId === undefined ? {} : { routeId: input.routeId }),
  ...(input.status === undefined ? {} : { status: input.status }),
  ...(input.sourceType === undefined
    ? {}
    : { gpsTracks: { some: { source: { type: input.sourceType } } } }),
  ...(input.from === undefined && input.to === undefined
    ? {}
    : {
        startTime: {
          ...(input.from === undefined ? {} : { gte: input.from }),
          ...(input.to === undefined ? {} : { lte: input.to }),
        },
      }),
});

export const buildTripHistoryListQuery = (input: TripHistoryListInput) => ({
  where: buildTripHistoryWhere(input),
  select: tripMetadataSelect,
  orderBy: [{ startTime: 'desc' as const }, { id: 'desc' as const }],
  skip: (input.page - 1) * input.pageSize,
  take: input.pageSize,
});

export const toTripHistorySummary = (trip: TripHistoryMetadataRecord) => {
  const { _count, ...metadata } = trip;
  return { ...metadata, trackCount: _count.gpsTracks };
};

export type TripSourceType = TrackingSourceType | 'unknown';

export interface TripSourceCountRow {
  tripId: string;
  sourceType: string | null;
  trackCount: number;
}

export interface TripSourceBreakdownEntry {
  sourceType: TripSourceType;
  trackCount: number;
}

const toTripSourceType = (value: string | null): TripSourceType =>
  TRACKING_SOURCE_TYPES.find((type) => type === value) ?? 'unknown';

/**
 * Groups per-trip track counts by source type. Tracks whose source was deleted
 * (source_id set to NULL) or whose type is unrecognised are reported as "unknown".
 * Entries are ordered by track count descending, then source type ascending.
 */
export const buildTripSourceBreakdown = (
  rows: readonly TripSourceCountRow[],
): Map<string, TripSourceBreakdownEntry[]> => {
  const totals = new Map<string, Map<TripSourceType, number>>();
  for (const row of rows) {
    const perTrip = totals.get(row.tripId) ?? new Map<TripSourceType, number>();
    const sourceType = toTripSourceType(row.sourceType);
    perTrip.set(sourceType, (perTrip.get(sourceType) ?? 0) + row.trackCount);
    totals.set(row.tripId, perTrip);
  }
  const breakdown = new Map<string, TripSourceBreakdownEntry[]>();
  for (const [tripId, perTrip] of totals) {
    breakdown.set(
      tripId,
      [...perTrip.entries()]
        .map(([sourceType, trackCount]) => ({ sourceType, trackCount }))
        .sort((left, right) => right.trackCount - left.trackCount || left.sourceType.localeCompare(right.sourceType)),
    );
  }
  return breakdown;
};

const readTripSourceCounts = async (
  tx: Prisma.TransactionClient,
  tripIds: readonly string[],
): Promise<TripSourceCountRow[]> => {
  if (tripIds.length === 0) return [];
  return tx.$queryRaw<TripSourceCountRow[]>`
    SELECT
      g.trip_id::text AS "tripId",
      s.type AS "sourceType",
      COUNT(*)::int AS "trackCount"
    FROM gps_tracks g
    LEFT JOIN tracking_sources s ON s.id = g.source_id
    WHERE g.trip_id IN (${Prisma.join(tripIds.map((id) => Prisma.sql`${id}::uuid`))})
    GROUP BY g.trip_id, s.type
  `;
};

/**
 * The filtered total, page, per-trip trackCount, and source breakdown are read in one
 * REPEATABLE READ snapshot so concurrent GPS ingestion cannot make them disagree.
 */
export const TRIP_HISTORY_LIST_ISOLATION = Prisma.TransactionIsolationLevel.RepeatableRead;

export const listTripHistory = async (input: TripHistoryListInput) => {
  const query = buildTripHistoryListQuery(input);
  const { total, trips, sourceCounts } = await prisma.$transaction(async (tx) => {
    const total = await tx.trip.count({ where: query.where });
    const trips = await tx.trip.findMany(query);
    const sourceCounts = await readTripSourceCounts(tx, trips.map((trip) => trip.id));
    return { total, trips, sourceCounts };
  }, { isolationLevel: TRIP_HISTORY_LIST_ISOLATION });
  const sourceBreakdown = buildTripSourceBreakdown(sourceCounts);
  return {
    data: trips.map((trip) => ({
      ...toTripHistorySummary(trip),
      sourceBreakdown: sourceBreakdown.get(trip.id) ?? [],
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
    trackSemantics: TRIP_HISTORY_TRACK_SEMANTICS,
    completeness: TRIP_HISTORY_COMPLETENESS,
    coordinatesIncluded: false,
  };
};

export const getTripHistoryMetadata = async (tripId: string) => {
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: tripMetadataSelect });
  if (!trip) throw notFound('Trip not found');
  return toTripHistorySummary(trip);
};

export const readCanonicalTrackPage = async (
  tripId: string,
  afterId: string | null,
  take: number,
): Promise<CanonicalTrackPoint[]> => {
  if (afterId === null) {
    return prisma.$queryRaw<CanonicalTrackPoint[]>`
      SELECT
        id::text AS id,
        recorded_at AS "recordedAt",
        ST_Y(location::geometry) AS lat,
        ST_X(location::geometry) AS lng,
        speed::text AS speed,
        heading::text AS heading,
        station,
        source_id AS "sourceId"
      FROM gps_tracks
      WHERE trip_id = ${tripId}::uuid
      ORDER BY id ASC
      LIMIT ${take}
    `;
  }

  return prisma.$queryRaw<CanonicalTrackPoint[]>`
    SELECT
      id::text AS id,
      recorded_at AS "recordedAt",
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng,
      speed::text AS speed,
      heading::text AS heading,
      station,
      source_id AS "sourceId"
    FROM gps_tracks
    WHERE trip_id = ${tripId}::uuid
      AND id > ${BigInt(afterId)}
    ORDER BY id ASC
    LIMIT ${take}
  `;
};

export const getTripHistoryDetail = async (tripId: string, pagination: BoundedPaginationInput) => {
  const trip = await getTripHistoryMetadata(tripId);
  const offset = (pagination.page - 1) * pagination.pageSize;
  const points = await prisma.$queryRaw<CanonicalTrackPoint[]>`
    SELECT
      id::text AS id,
      recorded_at AS "recordedAt",
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng,
      speed::text AS speed,
      heading::text AS heading,
      station,
      source_id AS "sourceId"
    FROM gps_tracks
    WHERE trip_id = ${tripId}::uuid
    ORDER BY id ASC
    OFFSET ${offset}
    LIMIT ${pagination.pageSize}
  `;
  return {
    trip,
    points,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: trip.trackCount,
      totalPages: Math.ceil(trip.trackCount / pagination.pageSize),
    },
    trackSemantics: TRIP_HISTORY_TRACK_SEMANTICS,
    completeness: TRIP_HISTORY_COMPLETENESS,
  };
};

export const TRIP_HISTORY_CSV_HEADER = [
  'record_type',
  'trip_id',
  'vehicle_id',
  'vehicle_name',
  'route_id',
  'route_name',
  'status',
  'start_time_utc',
  'end_time_utc',
  'end_reason',
  'track_semantics',
  'completeness',
  'track_id',
  'recorded_at_utc',
  'latitude',
  'longitude',
  'speed',
  'heading',
  'station',
  'source_id',
] as const;

type CsvValue = string | number | Date | null | undefined;

export const csvCell = (value: CsvValue): string => {
  if (value === null || value === undefined) return '';
  const raw = value instanceof Date ? value.toISOString() : String(value);
  const safe = typeof value === 'string' && /^[\t\r\n ]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};

const csvRow = (values: readonly CsvValue[]): string => `${values.map(csvCell).join(',')}\r\n`;

const metadataValues = (trip: Awaited<ReturnType<typeof getTripHistoryMetadata>>): CsvValue[] => [
  'trip_metadata', trip.id, trip.vehicle.id, trip.vehicle.name, trip.route.id, trip.route.name,
  trip.status, trip.startTime, trip.endTime, trip.endReason, TRIP_HISTORY_TRACK_SEMANTICS, TRIP_HISTORY_COMPLETENESS,
  null, null, null, null, null, null, null, null,
];

const pointValues = (
  trip: Awaited<ReturnType<typeof getTripHistoryMetadata>>,
  point: CanonicalTrackPoint,
): CsvValue[] => [
  'sampled_canonical_point', trip.id, trip.vehicle.id, trip.vehicle.name, trip.route.id, trip.route.name,
  trip.status, trip.startTime, trip.endTime, trip.endReason, TRIP_HISTORY_TRACK_SEMANTICS, TRIP_HISTORY_COMPLETENESS,
  point.id, point.recordedAt, point.lat, point.lng, point.speed, point.heading, point.station, point.sourceId,
];

export type CsvChunkWriter = (chunk: string) => void | Promise<void>;
export type TrackPageReader = (
  tripId: string,
  afterId: string | null,
  take: number,
) => Promise<CanonicalTrackPoint[]>;

export const streamTripHistoryCsv = async (
  trip: Awaited<ReturnType<typeof getTripHistoryMetadata>>,
  write: CsvChunkWriter,
  readPage: TrackPageReader = readCanonicalTrackPage,
  pageSize = 500,
): Promise<number> => {
  await write(csvRow(TRIP_HISTORY_CSV_HEADER));
  await write(csvRow(metadataValues(trip)));

  let afterId: string | null = null;
  let exportedPoints = 0;
  while (true) {
    const points = await readPage(trip.id, afterId, pageSize);
    for (const point of points) await write(csvRow(pointValues(trip, point)));
    exportedPoints += points.length;
    if (points.length < pageSize) return exportedPoints;
    afterId = points[points.length - 1]!.id;
  }
};
