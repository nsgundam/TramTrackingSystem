import { io } from "socket.io-client";

type BrowserSocketConnectionState = "connected" | "reconnecting" | "disconnected";

interface BrowserSocketTransportListeners {
  onConnect: () => void;
  onDisconnect: () => void;
  onConnectError: () => void;
  onReconnectAttempt: () => void;
  onLocationUpdate: (payload: unknown) => void;
}

export interface BrowserSocketTransport {
  subscribe: (listeners: BrowserSocketTransportListeners) => () => void;
  connect: () => void;
  disconnect: () => void;
}

export type BrowserSocketTransportFactory = (
  origin: string | undefined,
  options: { autoConnect: false },
) => BrowserSocketTransport;

interface BrowserSocketLifecycleOptions {
  origin: string | undefined;
  onConnectionStateChange: (state: BrowserSocketConnectionState) => void;
  onReconnect: () => void;
  onLocationUpdate: (payload: unknown) => void;
}

export interface BrowserSocketLifecycle {
  dispose: () => void;
}

const createSocketIoTransport: BrowserSocketTransportFactory = (origin, options) => {
  const socket = io(origin, options);

  return {
    subscribe: (listeners) => {
      socket.on("connect", listeners.onConnect);
      socket.on("disconnect", listeners.onDisconnect);
      socket.on("connect_error", listeners.onConnectError);
      socket.io.on("reconnect_attempt", listeners.onReconnectAttempt);
      socket.on("location-update", listeners.onLocationUpdate);

      return () => {
        socket.off("connect", listeners.onConnect);
        socket.off("disconnect", listeners.onDisconnect);
        socket.off("connect_error", listeners.onConnectError);
        socket.io.off("reconnect_attempt", listeners.onReconnectAttempt);
        socket.off("location-update", listeners.onLocationUpdate);
      };
    },
    connect: () => {
      socket.connect();
    },
    disconnect: () => {
      socket.disconnect();
    },
  };
};

export const startBrowserSocketLifecycle = (
  options: BrowserSocketLifecycleOptions,
  createTransport: BrowserSocketTransportFactory = createSocketIoTransport,
): BrowserSocketLifecycle => {
  let disposed = false;
  let hasConnected = false;
  const transport = createTransport(options.origin, { autoConnect: false });
  const unsubscribe = transport.subscribe({
    onConnect: () => {
      if (disposed) return;
      options.onConnectionStateChange("connected");
      if (hasConnected) options.onReconnect();
      hasConnected = true;
    },
    onDisconnect: () => {
      if (!disposed) options.onConnectionStateChange("disconnected");
    },
    onConnectError: () => {
      if (!disposed) options.onConnectionStateChange("reconnecting");
    },
    onReconnectAttempt: () => {
      if (!disposed) options.onConnectionStateChange("reconnecting");
    },
    onLocationUpdate: (payload) => {
      if (!disposed) options.onLocationUpdate(payload);
    },
  });

  transport.connect();

  return {
    dispose: () => {
      if (disposed) return;
      disposed = true;
      try {
        unsubscribe();
      } finally {
        transport.disconnect();
      }
    },
  };
};
