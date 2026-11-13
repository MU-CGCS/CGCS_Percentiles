import type { PercentileData } from './percentiles';
import type { Sex } from './traits';
import { loadScript } from './loadScript';

// Data files in public/data/ are JSONP-style scripts generated from
// webapp/data/*.json by scripts/prepare-static.mjs. Each one calls
// cfData("<key>", {...}) when it executes, which stores the payload in
// this registry.
const registry = new Map<string, unknown>();

window.cfData = (key: string, value: unknown) => {
  registry.set(key, value);
};

// One load per key, shared by all tabs for the lifetime of the page.
const cache = new Map<string, Promise<unknown>>();

export function loadData<T>(key: string): Promise<T> {
  let promise = cache.get(key);
  if (!promise) {
    promise = loadScript(`${import.meta.env.BASE_URL}data/${key}.js`).then(
      () => {
        if (!registry.has(key)) {
          throw new Error(`Data file for ${key} did not register itself`);
        }
        return registry.get(key);
      },
    );
    cache.set(key, promise);
  }
  return promise as Promise<T>;
}

export function loadPercentileData(
  sex: Sex,
  abbrev: string,
): Promise<PercentileData> {
  return loadData<PercentileData>(`${sex}_${abbrev}`);
}
