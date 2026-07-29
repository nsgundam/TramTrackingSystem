import { RESEARCH_METRIC_DEFINITION_VERSION } from './research-diagnostics.service.js';

export const DEFAULT_PAIRING_WINDOW_MS = 5_000;
export const MIN_VALID_RUNS_PER_SOURCE_VEHICLE = 3;

export interface MetricObservation {
  sourceId: string;
  sourceType: string;
  vehicleId?: string | null;
  backendReceiveTime: Date | string;
  producerEventTime?: Date | string | null;
  producerClockStatus?: string | null;
  validationOutcome: 'accepted' | 'rejected' | 'duplicate' | 'late' | 'invalid';
  canonicalDisposition: string;
  latitude?: number | null;
  longitude?: number | null;
  reportedAccuracyValue?: number | null;
  routeConformanceDistanceM?: number | null;
}

export interface PairMatch {
  left: MetricObservation;
  right: MetricObservation;
  differenceMs: number;
  distanceM: number;
}

export interface MetricSummary {
  metricDefinitionVersion: string;
  sampleCount: number;
  validCount: number;
  missingCount: number;
  duplicateCount: number;
  lateCount: number;
  availabilityCount: number;
  cadenceMeanMs: number | null;
  cadenceJitterMs: number | null;
  observedTimestampDifferenceMs: number | null;
  routeConformanceDistanceM: number | null;
  reportedAccuracyValue: number | null;
  groundTruthErrorM: null;
  canonicalSelectionShare: number | null;
  validity: 'sufficient_evidence' | 'insufficient_evidence';
  winner: null;
}

const time = (value: Date | string): number => new Date(value).getTime();

export const mean = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

export const standardDeviation = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const average = mean(values) ?? 0;
  return Math.sqrt(values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / values.length);
};

export const cadenceAndJitter = (observations: MetricObservation[]): {
  cadenceMeanMs: number | null;
  cadenceJitterMs: number | null;
} => {
  const ordered = [...observations]
    .filter((observation) => observation.validationOutcome === 'accepted')
    .sort((left, right) => time(left.backendReceiveTime) - time(right.backendReceiveTime));
  const gaps = ordered.slice(1).map((observation, index) =>
    time(observation.backendReceiveTime) - time(ordered[index]!.backendReceiveTime));
  return { cadenceMeanMs: mean(gaps), cadenceJitterMs: standardDeviation(gaps) };
};

export const observedTimestampDifferences = (observations: MetricObservation[]): number[] =>
  observations
    .filter((observation) => observation.producerEventTime && observation.producerClockStatus === 'synchronized')
    .map((observation) => time(observation.backendReceiveTime) - time(observation.producerEventTime!));

const haversineM = (
  left: { latitude: number; longitude: number },
  right: { latitude: number; longitude: number },
): number => {
  const radians = (value: number) => value * (Math.PI / 180);
  const dLat = radians(right.latitude - left.latitude);
  const dLon = radians(right.longitude - left.longitude);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(left.latitude)) * Math.cos(radians(right.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Pair raw points without snapping, smoothing, or declaring either source accurate. */
export const pairObservations = (
  left: MetricObservation[],
  right: MetricObservation[],
  pairingWindowMs = DEFAULT_PAIRING_WINDOW_MS,
): PairMatch[] => {
  const matches: PairMatch[] = [];
  const used = new Set<number>();
  for (const leftObservation of left) {
    if (leftObservation.latitude === null || leftObservation.longitude === null
      || leftObservation.latitude === undefined || leftObservation.longitude === undefined) continue;
    let bestIndex = -1;
    let bestDifference = Number.POSITIVE_INFINITY;
    right.forEach((rightObservation, index) => {
      if (used.has(index) || rightObservation.latitude === null || rightObservation.longitude === null
        || rightObservation.latitude === undefined || rightObservation.longitude === undefined) return;
      const difference = Math.abs(time(leftObservation.backendReceiveTime) - time(rightObservation.backendReceiveTime));
      if (difference <= pairingWindowMs && difference < bestDifference) {
        bestIndex = index;
        bestDifference = difference;
      }
    });
    if (bestIndex < 0) continue;
    const rightObservation = right[bestIndex]!;
    used.add(bestIndex);
    matches.push({
      left: leftObservation,
      right: rightObservation,
      differenceMs: bestDifference,
      distanceM: haversineM(
        { latitude: leftObservation.latitude, longitude: leftObservation.longitude },
        { latitude: rightObservation.latitude!, longitude: rightObservation.longitude! },
      ),
    });
  }
  return matches;
};

export const summarizeObservations = (
  observations: MetricObservation[],
  expectedRuns = MIN_VALID_RUNS_PER_SOURCE_VEHICLE,
): MetricSummary => {
  const accepted = observations.filter((observation) => observation.validationOutcome === 'accepted');
  const cadence = cadenceAndJitter(observations);
  const timestampDifferences = observedTimestampDifferences(observations);
  const routeDistances = accepted
    .map((observation) => observation.routeConformanceDistanceM)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const reportedAccuracy = accepted
    .map((observation) => observation.reportedAccuracyValue)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const validRuns = new Set(accepted.map((observation) => `${observation.sourceType}:${observation.vehicleId ?? 'unknown'}`)).size;

  return {
    metricDefinitionVersion: RESEARCH_METRIC_DEFINITION_VERSION,
    sampleCount: observations.length,
    validCount: accepted.length,
    missingCount: observations.filter((observation) => observation.validationOutcome === 'invalid').length,
    duplicateCount: observations.filter((observation) => observation.validationOutcome === 'duplicate').length,
    lateCount: observations.filter((observation) => observation.validationOutcome === 'late').length,
    availabilityCount: accepted.length,
    cadenceMeanMs: cadence.cadenceMeanMs,
    cadenceJitterMs: cadence.cadenceJitterMs,
    observedTimestampDifferenceMs: mean(timestampDifferences),
    routeConformanceDistanceM: mean(routeDistances),
    reportedAccuracyValue: mean(reportedAccuracy),
    groundTruthErrorM: null,
    canonicalSelectionShare: accepted.length === 0
      ? null
      : accepted.filter((observation) => observation.canonicalDisposition === 'selected').length / accepted.length,
    validity: validRuns >= expectedRuns ? 'sufficient_evidence' : 'insufficient_evidence',
    winner: null,
  };
};
