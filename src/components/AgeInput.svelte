<script lang="ts">
  import {
    MAX_YEARS,
    MIN_YEARS,
    validateMonthRange,
    validateYearRange,
  } from '../lib/validate';

  let {
    years = $bindable(12),
    months = $bindable(0),
    yearsLabel = 'Years',
    monthsLabel = 'Months',
  }: {
    years?: number;
    months?: number;
    yearsLabel?: string;
    monthsLabel?: string;
  } = $props();

  let yearsError = $state<string | null>(null);
  let monthsError = $state<string | null>(null);

  function onYearsChange() {
    const result = validateYearRange(years);
    if (!result.valid || result.value === null) {
      yearsError = result.error;
      return;
    }
    yearsError = null;
    years = result.value;
    // Age 24 is the data's upper bound: force months to 0 there.
    if (years === MAX_YEARS && months !== 0) {
      months = 0;
      monthsError = null;
    }
  }

  function onMonthsChange() {
    const result = validateMonthRange(months, years);
    if (!result.valid || result.value === null) {
      monthsError = result.error;
      return;
    }
    monthsError = null;
    months = result.value;
  }
</script>

<div class="field-row">
  <div class="field">
    <label>
      {yearsLabel}
      <input
        type="number"
        min={MIN_YEARS}
        max={MAX_YEARS}
        step="1"
        bind:value={years}
        onchange={onYearsChange}
      />
    </label>
    {#if yearsError}
      <div class="field-error">{yearsError}</div>
    {/if}
  </div>
  <div class="field">
    <label>
      {monthsLabel}
      <input
        type="number"
        min="0"
        max="11"
        step="1"
        bind:value={months}
        onchange={onMonthsChange}
        disabled={years === MAX_YEARS}
      />
    </label>
    {#if monthsError}
      <div class="field-error">{monthsError}</div>
    {/if}
  </div>
</div>
