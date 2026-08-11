import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("the public page keeps the browser tracker behind a server boundary", async () => {
  const page = await readSource("../app/page.tsx");

  assert.doesNotMatch(page, /["']use client["']/);
  assert.doesNotMatch(page, /next\/dynamic/);
  assert.doesNotMatch(page, /public-tracker-server-(shell|loader)/);
  assert.match(page, /<noscript>/);
});

test("the Leaflet tracker remains behind a narrow client-only boundary", async () => {
  const clientBoundary = await readSource(
    "../components/public/PublicTrackerClient.tsx",
  );

  assert.match(clientBoundary, /^["']use client["'];/);
  assert.match(clientBoundary, /dynamic\(.*ShuttleTracker/s);
  assert.match(clientBoundary, /ssr:\s*false/);
  assert.match(clientBoundary, /<LanguageProvider>/);
});
