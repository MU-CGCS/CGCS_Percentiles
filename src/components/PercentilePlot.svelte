<script lang="ts">
  import type { Annotations, Data } from 'plotly.js';
  import { getPlotly } from '../lib/plotly';
  import type { PercentileData } from '../lib/percentiles';
  import {
    baseLayout,
    cfColors,
    observationRed,
    percentileColors,
    percentilesToPlot,
  } from '../lib/colors';
  import {
    attachTooltip,
    ordinal,
    type HoverPoint,
    type TooltipSpec,
  } from '../lib/tooltip';

  export interface Observation {
    age: number;
    measurement: number;
  }

  let {
    data,
    observations = [],
    connect = false,
    title = '',
    subtitle = '',
    extreme = false,
    plotDiv = $bindable(null),
  }: {
    data: PercentileData | null;
    observations?: Observation[];
    connect?: boolean;
    title?: string;
    subtitle?: string;
    extreme?: boolean;
    plotDiv?: HTMLDivElement | null;
  } = $props();

  let wrapDiv = $state<HTMLElement | null>(null);
  let tipDiv = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!data || !plotDiv) {
      return;
    }
    render(plotDiv, data, observations, connect, title, subtitle, extreme);
  });

  function formatHover(pt: HoverPoint): TooltipSpec | null {
    const name = pt.data?.name ?? '';
    const age = `Age ${Number(pt.x).toFixed(2)} yr`;
    const mm = `${Number(pt.y).toFixed(1)} mm`;
    if (name.endsWith('%')) {
      const p = parseInt(name, 10);
      return {
        lines: [age, mm, `${ordinal(p)} percentile`],
        color: percentileColors[p] ?? cfColors.primary,
      };
    }
    return {
      lines: [age, mm],
      color: connect ? observationRed : cfColors.accent,
    };
  }

  async function render(
    div: HTMLDivElement,
    pd: PercentileData,
    obs: Observation[],
    connectObs: boolean,
    plotTitle: string,
    plotSubtitle: string,
    isExtreme: boolean,
  ) {
    const Plotly = await getPlotly();
    // Plot every 10th row like the Shiny app (slice(seq(1, n, by = 10))
    // in server_tab1.R): the percentile estimates carry small per-month
    // noise, and thinning + spline keeps the curves visually smooth.
    const step = 10;
    const thin = (values: number[]) =>
      values.filter((v, i) => i % step === 0 || i === values.length - 1);
    const thinnedAges = thin(pd.ages);
    const lastIndex = pd.ages.length - 1;

    const traces: Data[] = percentilesToPlot.map((p) => ({
      x: thinnedAges,
      y: thin(pd.percentiles[String(p)]),
      mode: 'lines',
      line: {
        color: percentileColors[p],
        width: 2,
        shape: 'spline',
        smoothing: 1.3,
      },
      opacity: 0.8,
      name: `${p}%`,
      hoverinfo: 'none',
    }));

    if (obs.length > 0) {
      if (connectObs) {
        traces.push({
          x: obs.map((o) => o.age),
          y: obs.map((o) => o.measurement),
          mode: 'lines+markers',
          line: { color: observationRed, width: 2 },
          marker: { color: observationRed, size: 9 },
          name: 'Observations',
          hoverinfo: 'none',
        });
      } else {
        // Accent ring with white core, matching the Shiny styling.
        traces.push({
          x: obs.map((o) => o.age),
          y: obs.map((o) => o.measurement),
          mode: 'markers',
          marker: {
            color: cfColors.accent,
            size: 16,
            line: { color: cfColors.accent, width: 2 },
          },
          name: 'Observation',
          hoverinfo: 'none',
        });
        traces.push({
          x: obs.map((o) => o.age),
          y: obs.map((o) => o.measurement),
          mode: 'markers',
          marker: { color: 'white', size: 6 },
          hoverinfo: 'skip',
          showlegend: false,
        });
      }
    }

    const annotations: Partial<Annotations>[] = percentilesToPlot.map(
      (p) => ({
        x: pd.ages[lastIndex],
        y: pd.percentiles[String(p)][lastIndex],
        text: `<b>${p}%</b>`,
        showarrow: false,
        xanchor: 'left',
        font: { color: 'white', size: 14 },
        bgcolor: percentileColors[p],
        borderpad: 2,
      }),
    );

    if (isExtreme) {
      annotations.push({
        xref: 'paper',
        yref: 'paper',
        x: 0.02,
        y: 0.98,
        text: '<b>⚠️ Extreme Value</b>',
        showarrow: false,
        font: { color: cfColors.error, size: 18 },
      });
    }

    const layout = baseLayout(plotTitle, plotSubtitle);
    layout.annotations = annotations;
    // Leave room for the right-edge percentile labels.
    layout.margin = { t: 70, r: 60, b: 60, l: 60 };

    await Plotly.react(div, traces, layout, {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    });

    if (wrapDiv && tipDiv) {
      attachTooltip(div, wrapDiv, tipDiv, formatHover);
    }
  }
</script>

<div class="plot-wrap" bind:this={wrapDiv}>
  <div class="plot-container" bind:this={plotDiv}></div>
  <div class="cf-tooltip" bind:this={tipDiv}></div>
</div>
