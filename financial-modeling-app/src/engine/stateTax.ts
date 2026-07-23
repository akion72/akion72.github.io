import type { GainSummary } from '../domain/types';

/**
 * Simplification: state tax is modeled as a single flat marginal rate applied to total
 * gain (most states tax capital gains as ordinary income, so a single rate is a
 * reasonable approximation rather than replicating each state's own bracket schedule).
 */
export function computeStateTax(gainSummary: GainSummary, stateTaxRatePct: number, ordinaryDeduction = 0): number {
  const taxableGain = Math.max(0, gainSummary.totalGain - ordinaryDeduction);
  return taxableGain * (stateTaxRatePct / 100);
}
