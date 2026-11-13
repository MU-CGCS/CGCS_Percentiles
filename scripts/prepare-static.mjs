// Generate the run-time assets that the static build loads as classic
// <script> tags (see src/lib/loadScript.ts):
//
//   data/<key>.json          -> public/data/<key>.js   cfData("<key>", ...)
//   node_modules/.../plotly  -> public/vendor/plotly.min.js
//
// Runs automatically before `vite` and `vite build` (predev/prebuild).
// Both output folders are gitignored.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const outDataDir = join(root, 'public', 'data');
const outVendorDir = join(root, 'public', 'vendor');

mkdirSync(outDataDir, { recursive: true });
mkdirSync(outVendorDir, { recursive: true });

let count = 0;
for (const file of readdirSync(dataDir)) {
  if (!file.endsWith('.json')) {
    continue;
  }
  const key = file.slice(0, -'.json'.length);
  // Re-serialize so the payload is guaranteed to be a single valid JSON
  // literal, whatever the source formatting.
  const json = JSON.stringify(JSON.parse(readFileSync(join(dataDir, file), 'utf-8')));
  writeFileSync(
    join(outDataDir, `${key}.js`),
    `cfData(${JSON.stringify(key)}, ${json});\n`,
  );
  count += 1;
}

copyFileSync(
  join(root, 'node_modules', 'plotly.js-dist-min', 'plotly.min.js'),
  join(outVendorDir, 'plotly.min.js'),
);

console.log(`prepare-static: wrote ${count} data scripts and plotly.min.js`);
