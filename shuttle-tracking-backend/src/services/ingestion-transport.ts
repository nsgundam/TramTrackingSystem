export type IngestionTransport = 'http' | 'socket' | 'ttn';

// ESP32 senders hold a persistent Socket.IO connection so every IoT sender
// shares one transport (and one latency profile) with the mobile sender path.
const SOCKET_ONLY_SOURCE_TYPES: ReadonlySet<string> = new Set(['esp32']);

export const isTransportAllowedForSource = (
  sourceType: string,
  transport: IngestionTransport,
): boolean => !SOCKET_ONLY_SOURCE_TYPES.has(sourceType) || transport === 'socket';
