const ICT_OFFSET_HOURS = 7;
const ICT_OFFSET_MS = ICT_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Converts a date input string (YYYY-MM-DD representing an Asia/Bangkok calendar day, or ISO)
 * to start-of-day UTC ISO string (00:00:00.000 ICT -> UTC).
 */
export const toStartOfDayIso = (dateStr: string): string | undefined => {
  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes("T")) {
    const d = new Date(trimmed);
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    const d = new Date(trimmed);
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined;
  }
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  const utcMidnight = Date.UTC(year, month, day, 0, 0, 0, 0);
  const ictStartInUtc = new Date(utcMidnight - ICT_OFFSET_MS);
  return Number.isFinite(ictStartInUtc.getTime()) ? ictStartInUtc.toISOString() : undefined;
};

/**
 * Converts a date input string (YYYY-MM-DD representing an Asia/Bangkok calendar day, or ISO)
 * to end-of-day UTC ISO string (23:59:59.999 ICT -> UTC) so that the chosen end date is inclusive.
 */
export const toEndOfDayIso = (dateStr: string): string | undefined => {
  const trimmed = dateStr.trim();
  if (!trimmed) return undefined;
  if (trimmed.includes("T")) {
    const d = new Date(trimmed);
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    const d = new Date(trimmed);
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined;
  }
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  const utcEndOfDay = Date.UTC(year, month, day, 23, 59, 59, 999);
  const ictEndInUtc = new Date(utcEndOfDay - ICT_OFFSET_MS);
  return Number.isFinite(ictEndInUtc.getTime()) ? ictEndInUtc.toISOString() : undefined;
};

/**
 * Validates that the start date is on or before the end date.
 * Returns an error string if invalid, or null if valid.
 */
export const validateDateRange = (fromStr: string, toStr: string): string | null => {
  const fromTrimmed = fromStr.trim();
  const toTrimmed = toStr.trim();
  if (!fromTrimmed || !toTrimmed) return null;

  const fromIso = toStartOfDayIso(fromTrimmed);
  const toIso = toEndOfDayIso(toTrimmed);

  if (!fromIso || !toIso) {
    return "Invalid date format.";
  }

  const fromTime = new Date(fromIso).getTime();
  const toTime = new Date(toIso).getTime();

  if (fromTime > toTime) {
    return "Start date must be on or before end date.";
  }

  return null;
};
