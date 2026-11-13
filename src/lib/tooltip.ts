// HTML hover tooltips replacing Plotly's native SVG hover labels.
//
// Brave's fingerprinting protection randomizes the SVG text-measurement
// APIs Plotly uses to lay out its hover labels, which scatters the label
// text across the page. HTML tooltips positioned from plotly_hover
// events are immune. Traces set hoverinfo: 'none' so events still fire
// but no SVG label is drawn.

export interface TooltipSpec {
  lines: string[];
  color: string;
}

export interface HoverPoint {
  x: number;
  y: number;
  data: { name?: string; line?: { color?: string } };
}

interface HoverEvent {
  points?: HoverPoint[];
  event: MouseEvent;
}

export function ordinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

const NAMED_COLORS: Record<string, string> = {
  red: '#FF0000',
  white: '#FFFFFF',
};

// Dark text on light backgrounds, white on dark — same rule Plotly's
// native labels use.
function contrastText(color: string): string {
  const hex = color.startsWith('#') ? color : (NAMED_COLORS[color] ?? '#888888');
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#2D3748' : '#FFFFFF';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function attachTooltip(
  plotDiv: HTMLDivElement,
  wrap: HTMLElement,
  tip: HTMLDivElement,
  format: (pt: HoverPoint) => TooltipSpec | null,
): void {
  // Plotly divs are event emitters; clear old handlers so repeated
  // Plotly.react calls don't stack them.
  const gd = plotDiv as HTMLDivElement & {
    on: (event: string, cb: (e: HoverEvent) => void) => void;
    removeAllListeners?: (event: string) => void;
  };
  gd.removeAllListeners?.('plotly_hover');
  gd.removeAllListeners?.('plotly_unhover');

  gd.on('plotly_hover', (e: HoverEvent) => {
    const pt = e.points?.[0];
    const spec = pt ? format(pt) : null;
    if (!spec) {
      tip.style.display = 'none';
      return;
    }
    tip.innerHTML = spec.lines.map(escapeHtml).join('<br>');
    tip.style.background = spec.color;
    tip.style.color = contrastText(spec.color);
    tip.style.display = 'block';

    const rect = wrap.getBoundingClientRect();
    let x = e.event.clientX - rect.left + 14;
    let y = e.event.clientY - rect.top - 12;
    if (x + tip.offsetWidth > rect.width - 4) {
      x = e.event.clientX - rect.left - tip.offsetWidth - 14;
    }
    if (y + tip.offsetHeight > rect.height - 4) {
      y = rect.height - tip.offsetHeight - 4;
    }
    if (y < 4) {
      y = 4;
    }
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  });

  gd.on('plotly_unhover', () => {
    tip.style.display = 'none';
  });
}
