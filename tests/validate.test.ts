import { describe, expect, it } from 'vitest';
import {
  validateMeasurement,
  validateMonthRange,
  validateYearRange,
  yrmoToYears,
} from '../src/lib/validate';

describe('validateYearRange', () => {
  it('accepts in-range integers', () => {
    expect(validateYearRange(12)).toEqual({
      valid: true,
      value: 12,
      error: null,
      corrected: false,
    });
  });

  it('floors non-integers', () => {
    expect(validateYearRange(12.9).value).toBe(12);
  });

  it('clamps below 4 and above 24', () => {
    expect(validateYearRange(2)).toMatchObject({ value: 4, corrected: true });
    expect(validateYearRange(25)).toMatchObject({
      value: 24,
      corrected: true,
    });
  });

  it('rejects empty and non-numeric input', () => {
    expect(validateYearRange('').valid).toBe(false);
    expect(validateYearRange('abc').valid).toBe(false);
    expect(validateYearRange(NaN).valid).toBe(false);
  });
});

describe('validateMonthRange', () => {
  it('clamps to 0-11', () => {
    expect(validateMonthRange(-1)).toMatchObject({
      value: 0,
      corrected: true,
    });
    expect(validateMonthRange(12)).toMatchObject({
      value: 11,
      corrected: true,
    });
    expect(validateMonthRange(7)).toMatchObject({
      value: 7,
      corrected: false,
    });
  });

  it('forces months to 0 at age 24 so total age stays <= 24', () => {
    expect(validateMonthRange(6, 24)).toMatchObject({
      value: 0,
      corrected: true,
    });
    expect(validateMonthRange(0, 24)).toMatchObject({
      value: 0,
      corrected: false,
    });
    expect(validateMonthRange(6, 23)).toMatchObject({
      value: 6,
      corrected: false,
    });
  });
});

describe('yrmoToYears', () => {
  it('reduces to years + months/12', () => {
    expect(yrmoToYears(4, 0)).toBe(4);
    expect(yrmoToYears(9, 3)).toBeCloseTo(9.25, 12);
    expect(yrmoToYears(17, 7)).toBeCloseTo(17 + 7 / 12, 12);
  });
});

describe('validateMeasurement', () => {
  it('parses positive numbers', () => {
    expect(validateMeasurement('100')).toBe(100);
    expect(validateMeasurement(' 37.1 ')).toBe(37.1);
  });

  it('rejects non-positive and non-numeric values', () => {
    expect(validateMeasurement('0')).toBeNull();
    expect(validateMeasurement('-5')).toBeNull();
    expect(validateMeasurement('abc')).toBeNull();
    expect(validateMeasurement('')).toBeNull();
  });
});
