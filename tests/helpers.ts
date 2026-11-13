import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PercentileData } from '../src/lib/percentiles';

const here = dirname(fileURLToPath(import.meta.url));

// Tests run in node, so read the source JSON straight from data/
// instead of loading it through a script tag.
export function readPercentileData(
  sex: string,
  abbrev: string,
): PercentileData {
  const file = join(here, '..', 'data', `${sex}_${abbrev}.json`);
  return JSON.parse(readFileSync(file, 'utf-8')) as PercentileData;
}

export function readFixture<T>(name: string): T {
  const file = join(here, 'fixtures', name);
  return JSON.parse(readFileSync(file, 'utf-8')) as T;
}
