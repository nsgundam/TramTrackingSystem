export const DEFAULT_ROUTE_COLOR = "#3B82F6" as const;

export type Rgb = readonly [red: number, green: number, blue: number];
export type ReadableForeground = "#000000" | "#FFFFFF";

const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;

const normalizedHex = (value: unknown): string | null => {
  if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value)) return null;
  const digits = value.slice(1);
  const expanded = digits.length === 3
    ? Array.from(digits, (digit) => `${digit}${digit}`).join("")
    : digits;
  return `#${expanded.toUpperCase()}`;
};

export const normalizeHexColor = (
  value: unknown,
  fallback: unknown = DEFAULT_ROUTE_COLOR,
): string => normalizedHex(value) ?? normalizedHex(fallback) ?? DEFAULT_ROUTE_COLOR;

export const parseHexColor = (value: unknown): Rgb | null => {
  const color = normalizedHex(value);
  if (!color) return null;
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
};

const channelLuminance = (channel: number) => {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = ([red, green, blue]: Rgb): number => (
  0.2126 * channelLuminance(red)
  + 0.7152 * channelLuminance(green)
  + 0.0722 * channelLuminance(blue)
);

const requireColor = (value: unknown): Rgb => {
  const color = parseHexColor(value);
  if (!color) throw new TypeError(`Expected a #RGB or #RRGGBB color, received ${String(value)}`);
  return color;
};

export const contrastRatio = (foreground: unknown, background: unknown): number => {
  const foregroundLuminance = relativeLuminance(requireColor(foreground));
  const backgroundLuminance = relativeLuminance(requireColor(background));
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

export const readableForegroundFor = (background: unknown): ReadableForeground => {
  const normalizedBackground = normalizeHexColor(background);
  return contrastRatio("#000000", normalizedBackground) >= contrastRatio("#FFFFFF", normalizedBackground)
    ? "#000000"
    : "#FFFFFF";
};

export const routeColorStyle = (background: unknown): Readonly<{
  backgroundColor: string;
  color: ReadableForeground;
}> => {
  const backgroundColor = normalizeHexColor(background);
  return {
    backgroundColor,
    color: readableForegroundFor(backgroundColor),
  };
};
