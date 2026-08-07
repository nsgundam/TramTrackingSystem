self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle http and https requests (ignores chrome-extension, ws, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Realtime transport must reach Socket.IO directly. Wrapping Engine.IO polling responses in a
  // Service Worker fetch can interrupt an in-flight upgrade and create a reconnect loop.
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/socket.io/')) {
    return;
  }

  // Required to meet PWA installation criteria in Chrome/Android
  event.respondWith(
    fetch(event.request).catch((err) => {
      console.warn('[Service Worker] Network request failed:', err);
      // Return a custom offline response instead of throwing uncaught promise rejection
      return new Response('Network connection error', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
      });
    })
  );
});
