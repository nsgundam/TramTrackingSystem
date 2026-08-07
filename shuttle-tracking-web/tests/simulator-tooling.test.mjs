import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const webRoot = new URL('../', import.meta.url);

test('Mobile simulator is local by default and credential-fail-closed', async () => {
  const [source, manualSource] = await Promise.all([
    readFile(new URL('simulate.js', webRoot), 'utf8'),
    readFile(new URL('simulate-manual.js', webRoot), 'utf8'),
  ]);

  assert.match(source, /process\.env\.API_URL/);
  assert.match(source, /process\.env\.SOCKET_URL/);
  assert.match(source, /'http:\/\/localhost:3001'/);
  assert.match(source, /process\.env\.TRACKING_SOURCE_SECRET_MOBILE\?\.trim\(\)/);
  assert.match(source, /process\.argv\.includes\('--once'\)/);
  assert.match(source, /Socket ACK ok=true/);
  assert.match(source, /socket\.disconnect\(\)/);

  assert.doesNotMatch(source, /onrender\.com/i);
  assert.doesNotMatch(source, /mobile_secret_key/i);
  for (const simulatorSource of [source, manualSource]) {
    assert.doesNotMatch(simulatorSource, /Token Claims|jwtDecode/);
    assert.doesNotMatch(simulatorSource, /console\.(?:log|error)\([^\n]*(?:Lat:|Lng:|Bearing:)/);
  }
  assert.match(manualSource, /Manual ACK ok=true/);
  assert.doesNotMatch(manualSource, /Failed to start trip registry:',\s*data/);
});

test('Mobile simulator exits before connecting when its credential is absent', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('simulate.js', webRoot)), '--once'], {
    cwd: fileURLToPath(webRoot),
    encoding: 'utf8',
    env: {
      ...process.env,
      API_URL: 'http://127.0.0.1:9',
      SOCKET_URL: 'http://127.0.0.1:9',
      TRACKING_SOURCE_SECRET: '',
      TRACKING_SOURCE_SECRET_MOBILE: '',
    },
    timeout: 5000,
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /TRACKING_SOURCE_SECRET_MOBILE is not defined/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /Connected to WebSocket/);
});

test('Manual Mobile simulator also exits before connecting when its credential is absent', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('simulate-manual.js', webRoot))], {
    cwd: fileURLToPath(webRoot),
    encoding: 'utf8',
    env: {
      ...process.env,
      API_URL: 'http://127.0.0.1:9',
      SOCKET_URL: 'http://127.0.0.1:9',
      TRACKING_SOURCE_SECRET_MOBILE: '',
    },
    timeout: 5000,
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /TRACKING_SOURCE_SECRET_MOBILE is not set/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /Connected to WebSocket/);
});

test('Playwright outputs stay out of Git and Docker build context', async () => {
  const [gitignore, dockerignore, packageJson] = await Promise.all([
    readFile(new URL('.gitignore', webRoot), 'utf8'),
    readFile(new URL('.dockerignore', webRoot), 'utf8'),
    readFile(new URL('package.json', webRoot), 'utf8'),
  ]);

  for (const artifact of ['test-results', 'playwright-report', 'blob-report']) {
    assert.match(gitignore, new RegExp(`/${artifact}/`));
    assert.match(dockerignore, new RegExp(`^${artifact}$`, 'm'));
  }

  const scripts = JSON.parse(packageJson).scripts;
  assert.equal(scripts['test:simulator-tooling'], 'node --test tests/simulator-tooling.test.mjs');
  assert.match(scripts.check, /npm run test:simulator-tooling/);
});
