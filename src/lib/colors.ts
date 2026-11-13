// Colors and shared Plotly styling, ported from cf_colors(),
// add_percentiles(), and theme_cf_modern() in includes.R.

import type { Layout } from 'plotly.js';

export const cfColors = {
  primary: '#1B4E8C',
  primaryLight: '#2A5FA0',
  secondary: '#20A39E',
  accent: '#FFB84D',
  success: '#A8E6CF',
  warning: '#FFD93D',
  error: '#FF6B6B',
  gray600: '#4A5568',
  gray400: '#A0AEC0',
} as const;

export const percentilesToPlot = [1, 5, 10, 25, 50, 75, 90, 95, 99] as const;

// Color ramp from add_percentiles(): symmetric around the 50th.
export const percentileColors: Record<number, string> = {
  1: cfColors.error,
  5: '#FF8A80',
  10: '#FFCC80',
  25: cfColors.warning,
  50: cfColors.primary,
  75: cfColors.warning,
  90: '#FFCC80',
  95: '#FF8A80',
  99: cfColors.error,
};

export const observationRed = 'red';

// Height of the percentile and growth-rate plots. Keep in sync with
// .plot-container min-height in styles/shell.css.
export const plotHeight = 900;

// Shared layout replicating theme_cf_modern(): Inter font, light panel,
// #E2E8F0 major grid, dark axis lines.
export function baseLayout(
  title?: string,
  subtitle?: string,
): Partial<Layout> {
  const titleText = title
    ? subtitle
      ? `<b>${title}</b><br><span style="font-size: 14px; color: #4A5568;">${subtitle}</span>`
      : `<b>${title}</b>`
    : undefined;
  return {
    title: titleText
      ? {
          text: titleText,
          font: { family: 'Inter, sans-serif', size: 16, color: '#1A202C' },
          x: 0.02,
          xanchor: 'left',
        }
      : undefined,
    font: { family: 'Inter, sans-serif', size: 12, color: '#2D3748' },
    paper_bgcolor: '#FEFEFE',
    plot_bgcolor: '#FEFEFE',
    xaxis: {
      title: {
        text: 'Age (years)',
        font: { size: 13, color: '#2D3748' },
      },
      gridcolor: '#E2E8F0',
      zeroline: false,
      linecolor: '#2D3748',
      linewidth: 1,
      ticks: 'outside',
      tickcolor: '#2D3748',
      tickfont: { size: 11, color: '#4A5568' },
      dtick: 1,
    },
    yaxis: {
      title: {
        text: 'Distance (mm)',
        font: { size: 13, color: '#2D3748' },
      },
      gridcolor: '#E2E8F0',
      zeroline: false,
      linecolor: '#2D3748',
      linewidth: 1,
      ticks: 'outside',
      tickcolor: '#2D3748',
      tickfont: { size: 11, color: '#4A5568' },
    },
    showlegend: false,
    margin: { t: 70, r: 50, b: 60, l: 60 },
    height: plotHeight,
  };
}
