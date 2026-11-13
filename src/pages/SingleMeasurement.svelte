<script lang="ts">
  import AgeInput from '../components/AgeInput.svelte';
  import PercentilePlot from '../components/PercentilePlot.svelte';
  import DerivativePlot from '../components/DerivativePlot.svelte';
  import Schematic from '../components/Schematic.svelte';
  import { loadPercentileData } from '../lib/data';
  import {
    calculateDerivative,
    calculatePercentile,
    interpolateDerivativeAtAge,
    isExtremePercentile,
    type DerivativeCurve,
    type PercentileData,
  } from '../lib/percentiles';
  import {
    formatTraitString,
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
    timestampedFilename,
  } from '../lib/report';

  let meta = $state<TraitsMeta | null>(null);
  let loadError = $state<string | null>(null);

  loadTraits()
    .then((m) => {
      meta = m;
    })
    .catch(() => {
      loadError = 'Failed to load trait definitions.';
    });

  let sex = $state<Sex>('Female');
  let years = $state(12);
  let months = $state(0);
  let trait = $state('Nasion-Basion');
  let measureText = $state('100');

  interface Result {
    data: PercentileData;
    sex: Sex;
    trait: string;
    traitString: string;
    age: number;
    measurement: number;
    percentile: number;
    extreme: boolean;
    curve: DerivativeCurve;
    patientDerivative: number | null;
  }

  let result = $state<Result | null>(null);
  let inputError = $state<string | null>(null);
  let calculating = $state(false);

  let percentilePlotDiv = $state<HTMLDivElement | null>(null);
  let derivativePlotDiv = $state<HTMLDivElement | null>(null);

  async function calculate() {
    inputError = null;
    if (!meta) {
      return;
    }
    const measurement = validateMeasurement(measureText);
    if (measurement === null) {
      inputError = 'Please enter a valid positive measurement value.';
      return;
    }
    calculating = true;
    try {
      const data = await loadPercentileData(sex, traitAbbrev(meta, trait));
      const age = yrmoToYears(years, months);
      const percentile = calculatePercentile(data, age, measurement);
      // Tab 1 computes the growth-rate curve on the patient's
      // percentile column, not the 50th (server_tab1.R behavior).
      const curve = calculateDerivative(data, percentile);
      result = {
        data,
        sex,
        trait,
        traitString: formatTraitString(sex, trait),
        age,
        measurement,
        percentile,
        extreme: isExtremePercentile(percentile),
        curve,
        patientDerivative: interpolateDerivativeAtAge(curve, age),
      };
    } catch {
      inputError = 'Error loading percentile data. Please check your inputs.';
    } finally {
      calculating = false;
    }
  }

  async function download() {
    if (!result || !percentilePlotDiv || !derivativePlotDiv) {
      return;
    }
    const images = [
      { dataUri: await plotToPng(percentilePlotDiv) },
      { dataUri: await plotToPng(derivativePlotDiv) },
    ];
    const html = buildReport({
      fields: [
        { label: 'Trait', value: result.trait },
        { label: 'Sex', value: result.sex },
        { label: 'Age', value: `${result.age.toFixed(2)} years` },
        {
          label: 'Observed measurement',
          value: `${result.measurement} mm`,
        },
        {
          label: 'Percentile',
          value:
            `${result.percentile}` +
            (result.extreme ? ' (Extreme Value)' : ''),
        },
      ],
      images,
    });
    downloadReport(timestampedFilename(), html);
  }
</script>

<div class="page-title">
  <h2>Single Measurement Percentile</h2>
  <div class="subtitle">Analyze individual craniofacial measurements</div>
</div>

{#if loadError}
  <div class="notice error">{loadError}</div>
{/if}

<div class="form-grid">
  <div class="ui segment hover-lift">
    <h4>Patient Information</h4>
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
    <h4>Measurement Details</h4>
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
    <div class="field">
      <label>
        Observed measurement (mm)
        <input type="text" bind:value={measureText} />
      </label>
    </div>
    <button
      class="ui primary button"
      onclick={calculate}
      disabled={calculating || !meta}
    >
      {calculating ? 'Calculating…' : 'Calculate Percentile'}
    </button>
    {#if result}
      <button class="ui secondary button" onclick={download}>
        Download Report
      </button>
    {:else}
      <p class="text-muted">Complete analysis to enable download</p>
    {/if}
    {#if inputError}
      <div class="notice warning">{inputError}</div>
    {/if}
  </div>

  <div class="ui segment hover-lift">
    <h4>Anatomical Reference</h4>
    <Schematic {meta} {trait} />
  </div>
</div>

{#if result}
  <div class="ui segment plot-segment">
    <h4>Percentile Analysis</h4>
    <PercentilePlot
      data={result.data}
      observations={[
        { age: result.age, measurement: result.measurement },
      ]}
      title={result.traitString}
      subtitle={`Percentile: ${result.percentile}` +
        (result.extreme ? ' (Extreme Value)' : '')}
      extreme={result.extreme}
      bind:plotDiv={percentilePlotDiv}
    />
  </div>

  <div class="ui segment plot-segment">
    <h4>Growth Rate Analysis</h4>
    <div class="subtitle">Rate of growth change over time</div>
    <DerivativePlot
      curve={result.curve}
      patientAge={result.age}
      patientDerivative={result.patientDerivative}
      title={result.traitString}
      bind:plotDiv={derivativePlotDiv}
    />
  </div>
{/if}
