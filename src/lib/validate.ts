// Input validation, ported from includes.R (validate_age_input,
// validate_year_range, validate_month_range, validate_measurement).
//
// Deliberate change from the Shiny app: years are clamped to 4-24 (not
// 4-25) because the data stops at age 24; when years is 24, months is
// additionally clamped to 0 so total age never exceeds 24.0.

export interface AgeValidation {
  valid: boolean;
  value: number | null;
  error: string | null;
  corrected: boolean;
}

export const MIN_YEARS = 4;
export const MAX_YEARS = 24;

function validateAgeInput(input: unknown): AgeValidation {
  if (input === null || input === undefined || input === '') {
    return {
      valid: false,
      value: null,
      error: 'Please enter a value',
      corrected: false,
    };
  }
  const numeric = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(numeric)) {
    return {
      valid: false,
      value: null,
      error: 'Please enter a numeric value',
      corrected: false,
    };
  }
  return {
    valid: true,
    value: Math.floor(numeric),
    error: null,
    corrected: false,
  };
}

export function validateYearRange(input: unknown): AgeValidation {
  const result = validateAgeInput(input);
  if (!result.valid || result.value === null) {
    return result;
  }
  let value = result.value;
  let corrected = false;
  if (value < MIN_YEARS) {
    value = MIN_YEARS;
    corrected = true;
  } else if (value > MAX_YEARS) {
    value = MAX_YEARS;
    corrected = true;
  }
  return { valid: true, value, error: null, corrected };
}

export function validateMonthRange(
  input: unknown,
  years?: number | null,
): AgeValidation {
  const result = validateAgeInput(input);
  if (!result.valid || result.value === null) {
    return result;
  }
  let value = result.value;
  let corrected = false;
  if (value < 0) {
    value = 0;
    corrected = true;
  } else if (value > 11) {
    value = 11;
    corrected = true;
  }
  if (years === MAX_YEARS && value !== 0) {
    value = 0;
    corrected = true;
  }
  return { valid: true, value, error: null, corrected };
}

// lubridate months(x)/years(1) reduces to x/12.
export function yrmoToYears(years: number, months: number): number {
  return years + months / 12;
}

// Port of validate_measurement(): positive number or null.
export function validateMeasurement(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}
