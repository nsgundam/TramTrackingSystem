import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { io } = require('../shuttle-tracking-web/node_modules/socket.io-client');
const socket = io(process.env.SOCKET_URL || 'http://localhost:3001', {
  autoConnect: false,
  reconnection: false,
});

await new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    socket.close();
    reject(new Error('Socket.IO boundary test timed out'));
  }, 5000);

  const fail = (error) => {
    clearTimeout(timeout);
    socket.close();
    reject(error);
  };

  socket.once('connect_error', fail);
  socket.io.once('error', fail);

  socket.once('connect', () => {
    socket.timeout(3000).emit(
      'send-location',
      { sourceId: 'TS_ESP_01', lat: 13.964139, lng: 100.587520 },
      (timeoutError, acknowledgement) => {
        clearTimeout(timeout);
        socket.close();
        if (timeoutError) {
          reject(timeoutError);
          return;
        }

        assert.equal(acknowledgement?.ok, false);
        assert.equal(acknowledgement?.code, 'SENDER_AUTH_REQUIRED');
        resolve();
      },
    );
  });

  socket.connect();
});

console.log('Unauthenticated Socket.IO sender write was rejected.');
