import type { GainSummary, Scenario, StrategyResult, TaxResult } from '../domain/types';
import { computeTaxResult } from '../engine/scenarioEngine';
import type { StrategyDefinition } from './types';

export function evaluateStrategy<TParams>(
  scenario: Scenario,
  gainSummary: GainSummary,
  baselineTaxResult: TaxResult,
  strategyDef: StrategyDefinition<TParams>,
  params: TParams,
): StrategyResult {
  const application = strategyDef.apply(scenario, gainSummary, params);
  const adjustedTaxResult = computeTaxResult(gainSummary, scenario.taxProfile, application.ordinaryDeduction);

  return {
    strategyId: strategyDef.id,
    label: strategyDef.label,
    capitalDeployed: application.capitalDeployed,
    taxSavings: baselineTaxResult.totalTax - adjustedTaxResult.totalTax,
    adjustedTaxResult,
    notes: application.notes,
  };
}
