import type { BaselineResult, GainSummary, Scenario, TaxProfile, TaxResult } from '../domain/types';
import { characterizeGain } from './gainCharacterization';
import { computeFederalTax } from './federalTax';
import { computeStateTax } from './stateTax';

export function computeTaxResult(
  gainSummary: GainSummary,
  taxProfile: TaxProfile,
  ordinaryDeduction = 0,
): TaxResult {
  const federal = computeFederalTax(gainSummary, taxProfile, ordinaryDeduction);
  const stateTax = computeStateTax(gainSummary, taxProfile.stateTaxRatePct, ordinaryDeduction);
  const totalTax = federal.total + stateTax;

  return {
    federalOrdinaryTax: federal.ordinaryTax,
    federalUnrecap1250Tax: federal.unrecap1250Tax,
    federalLtcgTax: federal.ltcgTax,
    federalNIIT: federal.niit,
    federalTaxTotal: federal.total,
    stateTax,
    totalTax,
    netCashAfterTax: gainSummary.totalSellerProceeds - totalTax,
  };
}

export function computeBaseline(scenario: Scenario): BaselineResult {
  const gainSummary = characterizeGain(scenario);
  const taxResult = computeTaxResult(gainSummary, scenario.taxProfile);
  return { gainSummary, taxResult };
}
