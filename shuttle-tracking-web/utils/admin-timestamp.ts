export type AdminTimestamp = Date | number | string;

const adminTimestampFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const shortMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * Formats a valid Admin timestamp for the Thailand operations timezone.
 * Returns null so each caller can preserve its existing unavailable-state copy.
 */
export const formatAdminTimestamp = (timestamp: AdminTimestamp | null | undefined): string | null => {
  if (timestamp === null || timestamp === undefined) return null;

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return null;

  const parts = Object.fromEntries(
    adminTimestampFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map(({ type, value }) => [type, value]),
  );
  const day = parts.day;
  const month = parts.month;
  const year = parts.year;
  const hour = parts.hour;
  const minute = parts.minute;
  const shortMonth = shortMonthNames[Number.parseInt(month ?? "", 10) - 1];

  if (!day || !shortMonth || !year || !hour || !minute) return null;

  return `${day} ${shortMonth} ${year}, ${hour}:${minute} ICT`;
};
