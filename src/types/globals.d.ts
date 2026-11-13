// Globals provided by classic <script> files loaded at run time (see
// lib/loadScript.ts): the JSONP-style data files call cfData(), and
// vendor/plotly.min.js assigns window.Plotly.

declare function cfData(key: string, value: unknown): void;

interface Window {
  cfData: typeof cfData;
  Plotly: typeof import('plotly.js');
}
