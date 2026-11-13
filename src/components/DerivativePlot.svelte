<script lang="ts">
  import type { Data, DataTitle } from 'plotly.js';
  import { getPlotly } from '../lib/plotly';
  import type { DerivativeCurve } from '../lib/percentiles';
  import { baseLayout, cfColors } from '../lib/colors';
  import {
    attachTooltip,
    type HoverPoint,
    type TooltipSpec,
  } from '../lib/tooltip';

  let {
    curve,
    patientAge = null,
    patientDerivative = null,
    title = '',
    plotDiv = $bindable(null),
  }: {
    curve: DerivativeCurve | null;
    patientAge?: number | null;
    patientDerivative?: number | null;
    title?: string;
    plotDiv?: HTMLDivElement | null;
  } = $props();

  let wrapDiv = $state<HTMLElement | null>(null);
  let tipDiv = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!curve || !plotDiv) {
      return;
    }
    render(plotDiv, curve, patientAge, patientDerivative, title);
  });

  function formatHover(pt: HoverPoint): TooltipSpec | null {
    const lines = [
      `Age ${Number(pt.x).toFixed(2)} yr`,
      `${Number(pt.y).toFixed(2)} mm/yr`,
    ];
    if (pt.data?.name === 'Patient') {
      return { lines, color: cfColors.accent };
    }
    return { lines, color: cfColors.primary };
  }

  async function render(
    div: HTMLDivElement,
    dc: DerivativeCurve,
    age: number | null,
    derivative: number | null,
    plotTitle: string,
  ) {
    const Plotly = await getPlotly();
    const traces: Data[] = [
      {
        x: dc.ages,
        y: dc.derivatives,
        mode: 'lines',
        line: { color: cfColors.primary, width: 3 },
        opacity: 0.8,
        name: 'Growth rate',
        hoverinfo: 'none',
      },
    ];

    const hasPatient = age !== null && derivative !== null;
    if (hasPatient) {
      traces.push({
        x: [age],
        y: [derivative],
        mode: 'markers',
        marker: {
          color: cfColors.accent,
          size: 16,
          line: { color: cfColors.accent, width: 2 },
        },
        name: 'Patient',
        hoverinfo: 'none',
      });
      traces.push({
        x: [age],
        y: [derivative],
        mode: 'markers',
        marker: { color: 'white', size: 6 },
        hoverinfo: 'skip',
        showlegend: false,
      });
    }

    const subtitle = hasPatient
      ? `Current growth rate estimate: ${(derivative as number).toFixed(1)} mm/yr`
      : '';

    const layout = baseLayout(
      plotTitle ? `${plotTitle} - Growth Rate` : '',
      subtitle,
    );
    if (layout.yaxis?.title) {
      (layout.yaxis.title as Partial<DataTitle>).text =
        'Growth Rate (mm/year)';
    }

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
