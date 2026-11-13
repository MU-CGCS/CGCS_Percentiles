import { describe, expect, it } from 'vitest';
import {
  calculateDerivative,
  calculatePercentile,
  interpolateDerivativeAtAge,
} from '../src/lib/percentiles';
import { readFixture, readPercentileData } from './helpers';

interface PercentileCase {
  sex: string;
  abbrev: string;
  age: number;
  measurement: number;
  expected: number;
}

interface DerivativeCurveFixture {
  sex: string;
  abbrev: string;
  percentile: number;
  ages: number[];
  derivatives: number[];
}

interface InterpolationCase {
  sex: string;
  abbrev: string;
  percentile: number;
  targetAge: number;
  expected: number | null;
}

describe('calculatePercentile', () => {
  const cases = readFixture<PercentileCase[]>('percentile_cases.json');

  it('matches R fixtures exactly', () => {
    for (const c of cases) {
      const data = readPercentileData(c.sex, c.abbrev);
      const result = calculatePercentile(data, c.age, c.measurement);
      expect(
        result,
        `${c.sex} ${c.abbrev} age=${c.age} m=${c.measurement}`,
      ).toBe(c.expected);
    }
  });
});

describe('calculateDerivative', () => {
  const curves = readFixture<DerivativeCurveFixture[]>(
    'derivative_curves.json',
  );

  it('matches R curves within 1e-6', () => {
    for (const curve of curves) {
      const data = readPercentileData(curve.sex, curve.abbrev);
      const result = calculateDerivative(data, curve.percentile);
      const label = `${curve.sex} ${curve.abbrev} p=${curve.percentile}`;
      expect(result.ages.length, label).toBe(curve.ages.length);
      for (let i = 0; i < curve.ages.length; i++) {
        expect(result.ages[i], `${label} age[${i}]`).toBeCloseTo(
          curve.ages[i],
          6,
        );
        expect(result.derivatives[i], `${label} d[${i}]`).toBeCloseTo(
          curve.derivatives[i],
          6,
        );
      }
    }
  });
});

describe('interpolateDerivativeAtAge', () => {
  const cases = readFixture<InterpolationCase[]>('interpolation_cases.json');

  it('matches R approx() within 1e-6, null outside range', () => {
    for (const c of cases) {
      const data = readPercentileData(c.sex, c.abbrev);
      const curve = calculateDerivative(data, c.percentile);
      const result = interpolateDerivativeAtAge(curve, c.targetAge);
      const label = `${c.sex} ${c.abbrev} p=${c.percentile} t=${c.targetAge}`;
      if (c.expected === null || c.expected === undefined) {
        expect(result, label).toBeNull();
      } else {
        expect(result, label).not.toBeNull();
        expect(result as number, label).toBeCloseTo(c.expected, 6);
      }
    }
  });
});
