<script lang="ts">
  import AgeInput from '../components/AgeInput.svelte';
  import PercentilePlot from '../components/PercentilePlot.svelte';
  import ResultsTable from '../components/ResultsTable.svelte';
  import { loadPercentileData } from '../lib/data';
  import {
    calculatePercentile,
    round2,
    type PercentileData,
  } from '../lib/percentiles';
  import {
    loadTraits,
    traitAbbrev,
    type Sex,
    type TraitsMeta,
  } from '../lib/traits';
  import { validateMeasurement, yrmoToYears } from '../lib/validate';
  import {
    buildReport,
    downloadReport,
    plotToPng,
    tableHtml,
  } from '../lib/report';

  let meta = $state<TraitsMeta | null>(null);

  loadTraits().then((m) => {
    meta = m;
  });

  let sex = $state<Sex>('Male');
  let trait = $state('Sella-Basion');
  let yearsList = $state([9, 12, 16]);
  let monthsList = $state([0, 0, 0]);
  let measureTexts = $state(['37.1', '40.5', '42.2']);

  const columns = [
    'Sex',
    'Measurement',
    'Age (yr)',
    'Measurement (mm)',
    'Percentile',
  ];

  interface Result {
    data: PercentileData;
    rows: (string | number)[][];
    observations: { age: number; measurement: number }[];
  }

  let result = $state<Result | null>(null);
  let inputError = $state<string | null>(null);
  let calculating = $state(false);
  let plotDiv = $state<HTMLDivElement | null>(null);

  async function calculate() {
    inputError = null;
    if (!meta) {
      return;
    }
    const measurements = measureTexts.map(validateMeasurement);
    if (measurements.some((m) => m === null)) {
      inputError = 'Please enter valid positive measurement values.';
      return;
    }
    calculating = true;
    try {
      const data = await loadPercentileData(sex, traitAbbrev(meta, trait));
      const rows: (string | number)[][] = [];
      const observations: { age: number; measurement: number }[] = [];
      for (let i = 0; i < 3; i++) {
        const age = yrmoToYears(yearsList[i], monthsList[i]);
        const measurement = measurements[i] as number;
        const percentile = calculatePercentile(data, age, measurement);
        rows.push([sex, trait, round2(age), measurement, percentile]);
        observations.push({ age, measurement });
      }
      result = { data, rows, observations };
    } catch {
      inputError = 'Error loading percentile data. Please check your inputs.';
    } finally {
      calculating = false;
    }
  }

  async function download() {
    if (!result || !plotDiv) {
      return;
    }
    const html = buildReport({
      fields: [],
      table: tableHtml(columns, result.rows),
      images: [{ dataUri: await plotToPng(plotDiv) }],
    });
    downloadReport('MTreport.html', html);
  }
</script>

<div class="page-title">
  <h2>Time Series Analysis</h2>
  <div class="subtitle">One trait from a single patient over time</div>
</div>

<div class="ui segment hover-lift">
  <h4>Study Information</h4>
  <div class="form-grid">
    <div class="field">
      <label>
        Sex
        <select bind:value={sex}>
          <option>Female</option>
          <option>Male</option>
        </select>
      </label>
    </div>
    <div class="field">
      <label>
        Trait
        <select bind:value={trait}>
          {#each meta?.traits ?? [] as t (t.abbrev)}
            <option value={t.name}>{t.name}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>
</div>

<div class="ui segment hover-lift">
  <h4>Time Points</h4>
  <div class="form-grid">
    {#each yearsList as _, i (i)}
      <div>
        <h5>Time Point {i + 1}</h5>
        <AgeInput
          bind:years={yearsList[i]}
          bind:months={monthsList[i]}
        />
        <div class="field">
          <label>
            Measurement (mm)
            <input type="text" bind:value={measureTexts[i]} />
          </label>
        </div>
      </div>
    {/each}
  </div>
</div>

<div class="ui segment hover-lift">
  <button
    class="ui primary button"
    onclick={calculate}
    disabled={calculating || !meta}
  >
    {calculating ? 'Calculating…' : 'Calculate'}
  </button>
  {#if result}
    <button class="ui secondary button" onclick={download}>
      Download Report
    </button>
  {/if}
  {#if inputError}
    <div class="notice warning">{inputError}</div>
  {/if}
</div>

{#if result}
  <div class="ui segment hover-lift slide-up">
    <h4>Results Table</h4>
    <ResultsTable {columns} rows={result.rows} />
  </div>

  <div class="ui segment plot-segment">
    <PercentilePlot
      data={result.data}
      observations={result.observations}
      connect={true}
      title={trait}
      subtitle="Percentile curves with measurements"
      bind:plotDiv
    />
  </div>
{/if}
