import type { Response } from 'express';

export const RESEARCH_EXPORT_SCHEMA_VERSION = 't7-csv-v1';
export const RESEARCH_EXPORT_PAGE_SIZE = 250;
export const RESEARCH_EXPORT_MAX_ROWS = 5_000;
export const RESEARCH_EXPORT_MAX_WINDOW_MS = 31 * 24 * 60 * 60 * 1000;

export const RESEARCH_EXPORT_FIELDS = [
  'schema_version',
  'session_alias',
  'source_alias',
  'source_type',
  'vehicle_alias',
  'route_alias',
  'transport',
  'received_at',
  'producer_event_time',
  'event_time_quality',
  'source_sequence',
  'validation_outcome',
  'canonical_disposition',
  'latitude',
  'longitude',
  'speed_mps',
  'heading_deg',
  'reported_accuracy_value',
  'reported_accuracy_unit',
  'reported_accuracy_kind',
  'battery_percentage',
  'wifi_rssi',
  'lorawan_rssi',
  'lorawan_snr',
] as const;

export type ResearchExportRow = Partial<Record<typeof RESEARCH_EXPORT_FIELDS[number], unknown>>;

const safeCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  const formulaSafe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\r\n]/.test(formulaSafe)
    ? `"${formulaSafe.replace(/"/g, '""')}"`
    : formulaSafe;
};

export const csvHeader = (): string => `${RESEARCH_EXPORT_FIELDS.join(',')}\n`;

export const rowToCsv = (row: ResearchExportRow): string =>
  `${RESEARCH_EXPORT_FIELDS.map((field) => safeCell(row[field])).join(',')}\n`;

const waitForDrain = (response: Response): Promise<void> => new Promise((resolve, reject) => {
  response.once('drain', resolve);
  response.once('error', reject);
});

export async function streamResearchCsv(
  response: Response,
  rows: AsyncIterable<ResearchExportRow>,
): Promise<{ rowCount: number; complete: boolean }> {
  response.setHeader('Content-Type', 'text/csv; charset=utf-8');
  response.setHeader('Content-Disposition', 'attachment; filename="t7-research-export.csv"');
  response.write(csvHeader());

  let rowCount = 0;
  try {
    for await (const row of rows) {
      rowCount += 1;
      if (!response.write(rowToCsv(row))) await waitForDrain(response);
    }
    response.end();
    return { rowCount, complete: true };
  } catch {
    if (!response.headersSent) response.status(500);
    response.end();
    return { rowCount, complete: false };
  }
}

export const validateExportWindow = (
  from: Date | null,
  to: Date | null,
): boolean => {
  if (!from || !to) return true;
  return to.getTime() >= from.getTime()
    && to.getTime() - from.getTime() <= RESEARCH_EXPORT_MAX_WINDOW_MS;
};
