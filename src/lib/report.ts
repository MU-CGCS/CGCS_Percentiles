// Client-side HTML report builder, replacing the rmarkdown::render +
// JS-injection flow in the Shiny app. Layout/text mirrors the Rmd
// reports; all computation comes from lib/percentiles.ts (the Rmds'
// own calculations are not replicated -- see PLAN.md section 4).

import { getPlotly } from './plotly';

export interface ReportField {
  label: string;
  value: string;
}

export interface ReportImage {
  dataUri: string;
  caption?: string;
}

const DISCLAIMER_TEXT =
  'Craniofacial growth can be affected by many factors. This software ' +
  'is not intended for use for medical diagnostic or treatment ' +
  'purposes. The authors and their affiliated institutions are not ' +
  'liable for any damages to users or third parties arising from the ' +
  'use of this software.';

export async function plotToPng(div: HTMLDivElement): Promise<string> {
  const Plotly = await getPlotly();
  return Plotly.toImage(div, {
    format: 'png',
    width: 900,
    height: 600,
    scale: 2,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function tableHtml(
  columns: string[],
  rows: (string | number)[][],
): string {
  const percentileIndex = columns.indexOf('Percentile');
  const head = columns
    .map((c) => `<th>${escapeHtml(c)}</th>`)
    .join('');
  const body = rows
    .map((row) => {
      const cells = row
        .map((cell, j) => {
          const cls = j === percentileIndex ? ' class="percentile"' : '';
          return `<td${cls}>${escapeHtml(String(cell))}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('\n');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function buildReport(options: {
  fields: ReportField[];
  table?: string;
  images?: ReportImage[];
}): string {
  const fieldsHtml = options.fields
    .map(
      (f) =>
        `<p><strong>${escapeHtml(f.label)}</strong>: ` +
        `${escapeHtml(f.value)}</p>`,
    )
    .join('\n');

  const imagesHtml = (options.images ?? [])
    .map((img) => {
      const caption = img.caption
        ? `<p class="caption">${escapeHtml(img.caption)}</p>`
        : '';
      return `<div class="figure"><img src="${img.dataUri}" alt="">${caption}</div>`;
    })
    .join('\n');

  const date = new Date().toLocaleDateString();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Craniofacial Percentile</title>
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    max-width: 900px;
    margin: 2em auto;
    padding: 0 1em;
    color: #2D3748;
    line-height: 1.5;
  }
  h1 { color: #1B4E8C; }
  .disclaimer {
    background: #fffbeb;
    border: 1px solid #FFD93D;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 0.9em;
    color: #a16207;
  }
  .figure { margin: 1.5em 0; }
  .figure img { max-width: 100%; height: auto; }
  .caption { font-size: 0.9em; color: #4A5568; }
  table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
  th, td { border: 1px solid #CBD5E0; padding: 8px 12px; text-align: left; }
  th { background: #1B4E8C; color: white; }
  tr:nth-child(even) { background: #F7F9FC; }
  td.percentile { color: firebrick; font-weight: bold; }
  .date { color: #718096; font-size: 0.9em; margin-top: 2em; }
</style>
</head>
<body>
<h1>Craniofacial Percentile</h1>
<div class="disclaimer">${DISCLAIMER_TEXT}</div>
${fieldsHtml}
${options.table ?? ''}
${imagesHtml}
<p class="date">Date generated: ${date}</p>
</body>
</html>
`;
}

export function downloadReport(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Matches the Shiny tab 1 filename: CF_Analysis_YYYYMMDD_HHMMSS.html
export function timestampedFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `CF_Analysis_${date}_${time}.html`;
}
