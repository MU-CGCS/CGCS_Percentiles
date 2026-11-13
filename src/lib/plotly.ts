// Lazy loader for Plotly. The plotly.js bundle is ~4.8MB minified, so it
// is loaded as a classic script (public/vendor/plotly.min.js, copied from
// node_modules by scripts/prepare-static.mjs) the first time a plot is
// rendered instead of on initial page load.

import { loadScript } from './loadScript';

export type PlotlyModule = typeof import('plotly.js');

let plotlyPromise: Promise<PlotlyModule> | null = null;

export function getPlotly(): Promise<PlotlyModule> {
  if (!plotlyPromise) {
    plotlyPromise = loadScript(
      `${import.meta.env.BASE_URL}vendor/plotly.min.js`,
    ).then(() => window.Plotly);
  }
  return plotlyPromise;
}
