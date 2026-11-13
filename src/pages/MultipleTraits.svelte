<script lang="ts">
  import AgeInput from '../components/AgeInput.svelte';
  import ResultsTable from '../components/ResultsTable.svelte';
  import { loadPercentileData } from '../lib/data';
  import { calculatePercentile, round2 } from '../lib/percentiles';
  import {
    loadTraits,
    traitAbbrev,
    type Sex,
    type TraitsMeta,
  } from '../lib/traits';
  import { validateMeasurement, yrmoToYears } from '../lib/validate';
  import { buildReport, downloadReport, tableHtml } from '../lib/report';

  let meta = $state<TraitsMeta | null>(null);

  loadTraits().then((m) => {
    meta = m;
  });

  let sex = $state<Sex>('Female');
  let years = $state(12);
  let months = $state(0);
  let traits = $state(['ANS-PNS', 'Articulare-Pogonion', 'Nasion-Basion']);
  let measureTexts = $state(['45', '90', '100']);

  const columns = [
    'Sex',
    'Age (yr)',
    'Measurement',
    'Measurement (mm)',
    'Percentile',
  ];

  let rows = $state<(string | number)[][] | null>(null);
  let inputError = $state<string | null>(null);
  let calculating = $state(false);

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
      const age = yrmoToYears(years, months);
      const m = meta;
      const newRows: (string | number)[][] = [];
      for (let i = 0; i < traits.length; i++) {
        const data = await loadPercentileData(
          sex,
          traitAbbrev(m, traits[i]),
        );
        const measurement = measurements[i] as number;
        const percentile = calculatePercentile(data, age, measurement);
        newRows.push([
          sex,
          round2(age),
          traits[i],
          measurement,
          percentile,
        ]);
      }
      rows = newRows;
    } catch {
      inputError = 'Error loading percentile data. Please check your inputs.';
    } finally {
      calculating = false;
    }
  }

  function download() {
    if (!rows) {
      return;
    }
    const html = buildReport({
      fields: [],
      table: tableHtml(columns, rows),
    });
    downloadReport('MMreport.html', html);
  }
</script>

<div class="page-title">
  <h2>Multiple Measurements Analysis</h2>
  <div class="subtitle">
    Several traits from a single patient at one age
  </div>
</div>

<div class="ui segment hover-lift">
  <h4>Patient Information</h4>
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
    <AgeInput bind:years bind:months />
  </div>
</div>

<div class="ui segment hover-lift">
  <h4>Measurements</h4>
  <div class="form-grid">
    {#each traits as _, i (i)}
      <div>
        <h5>Measurement {i + 1}</h5>
        <div class="field">
          <label>
            Trait
            <select bind:value={traits[i]}>
              {#each meta?.traits ?? [] as t (t.abbrev)}
                <option value={t.name}>{t.name}</option>
              {/each}
            </select>
          </label>
        </div>
        <div class="field">
          <label>
            Value (mm)
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
  {#if rows}
    <button class="ui secondary button" onclick={download}>
      Download Report
    </button>
  {/if}
  {#if inputError}
    <div class="notice warning">{inputError}</div>
  {/if}
</div>

{#if rows}
  <div class="ui segment hover-lift slide-up">
    <h4>Results</h4>
    <ResultsTable {columns} {rows} />
  </div>
{/if}
