import { describe, expect, it } from 'vitest';
import type { GainSummary, TaxProfile } from '../../domain/types';
import { computeFederalTax } from '../federalTax';

const baseProfile: TaxProfile = {
  filingStatus: 'single',
  otherOrdinaryIncome: 0,
  stateName: 'test',
  stateTaxRatePct: 0,
  sellerMateriallyParticipates: true,
};

const emptyGain: GainSummary = {
  sellerProceedsFixed: 0,
  sellerProceedsEarnout: 0,
  ordinaryIncome: 0,
  unrecap1250Gain: 0,
  longTermCapitalGain: 0,
  totalGain: 0,
  totalSellerProceeds: 0,
};

describe('computeFederalTax', () => {
  it('computes progressive ordinary tax across 2025 single brackets', () => {
    const result = computeFederalTax(emptyGain, { ...baseProfile, otherOrdinaryIncome: 700_000 });
    expect(result.ordinaryTax).toBeCloseTo(216_020.25, 2);
  });

  it('stacks LTCG on top of ordinary income for bracket purposes', () => {
    const gain: GainSummary = { ...emptyGain, longTermCapitalGain: 1_000_000, totalGain: 1_000_000 };
    const result = computeFederalTax(gain, baseProfile);
    // 0% to 48,350; 15% to 533,400; 20% above, for a single filer with no other income.
    expect(result.ltcgTax).toBeCloseTo(166_077.5, 2);
  });

  it('applies NIIT to the gain when the seller does not materially participate', () => {
    const gain: GainSummary = { ...emptyGain, longTermCapitalGain: 1_000_000, totalGain: 1_000_000 };
    const passive = computeFederalTax(gain, { ...baseProfile, sellerMateriallyParticipates: false });
    const active = computeFederalTax(gain, { ...baseProfile, sellerMateriallyParticipates: true });
    expect(passive.niit).toBeCloseTo(30_400, 2);
    expect(active.niit).toBe(0);
  });

  it('taxes unrecaptured 1250 gain at a flat 25%', () => {
    const gain: GainSummary = { ...emptyGain, unrecap1250Gain: 100_000, totalGain: 100_000 };
    const result = computeFederalTax(gain, baseProfile);
    expect(result.unrecap1250Tax).toBe(25_000);
  });

  it('reduces ordinary taxable income by a strategy deduction', () => {
    const gain: GainSummary = { ...emptyGain, ordinaryIncome: 500_000, totalGain: 500_000 };
    const withoutDeduction = computeFederalTax(gain, baseProfile);
    const withDeduction = computeFederalTax(gain, baseProfile, 200_000);
    expect(withDeduction.ordinaryTax).toBeLessThan(withoutDeduction.ordinaryTax);
  });
});
