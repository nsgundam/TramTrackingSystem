import assert from 'node:assert/strict';

const redisUrl = 'redis://user:password@example.test:6379/0?token=secret';
process.env.REDIS_URL = redisUrl;

const logs = [];
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => logs.push(args.join(' '));
console.error = (...args) => logs.push(args.join(' '));

try {
  const { redisClient } = await import(`../dist/config/redis.js?test=${Date.now()}`);
  redisClient.emit('connect');
  redisClient.emit('error', new Error(redisUrl));
} finally {
  console.log = originalLog;
  console.error = originalError;
}

const output = logs.join('\n');
assert.match(output, /\[Redis\] Connected/);
assert.equal(output.includes(redisUrl), false);
assert.equal(output.includes('password'), false);
assert.equal(output.includes('token=secret'), false);
assert.equal(output.includes('Error:'), false);

console.log('Redis logging boundary tests passed.');
