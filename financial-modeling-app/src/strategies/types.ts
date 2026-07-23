import type { GainSummary, Scenario } from '../domain/types';

export interface StrategyApplication {
  ordinaryDeduction: number;
  capitalDeployed: number;
  notes: string[];
}

export interface StrategyDefinition<TParams> {
  id: string;
  label: string;
  description: string;
  createDefaultParams: () => TParams;
  apply: (scenario: Scenario, gainSummary: GainSummary, params: TParams) => StrategyApplication;
}
