import { describe, expect, it } from 'vitest';
import { buildScenario, line } from '../../engine/__tests__/testHelpers';
import { characterizeGain } from '../../engine/gainCharacterization';
import { computeTaxResult } from '../../engine/scenarioEngine';
import { bonusDepreciationRealProperty } from '../bonusDepreciationRealProperty';
import { evaluateStrategy } from '../evaluate';

describe('bonusDepreciationRealProperty', () => {
  it('computes the bonus-eligible basis from land allocation and cost-seg share', () => {
    const application = bonusDepreciationRealProperty.apply(
      buildScenario(),
      { sellerProceedsFixed: 0, sellerProceedsEarnout: 0, ordinaryIncome: 0, unrecap1250Gain: 0, longTermCapitalGain: 0, totalGain: 0, totalSellerProceeds: 0 },
      { reinvestmentAmount: 1_000_000, landAllocationPct: 20, shortLifeSegregationPct: 25, qualifiesForNonPassiveTreatment: true },
    );
    // depreciable basis = 800,000; bonus-eligible = 25% of that = 200,000
    expect(application.ordinaryDeduction).toBe(200_000);
    expect(application.capitalDeployed).toBe(1_000_000);
  });

  it('suspends the deduction as a passive loss when the seller does not qualify', () => {
    const application = bonusDepreciationRealProperty.apply(
      buildScenario(),
      { sellerProceedsFixed: 0, sellerProceedsEarnout: 0, ordinaryIncome: 0, unrecap1250Gain: 0, longTermCapitalGain: 0, totalGain: 0, totalSellerProceeds: 0 },
      { reinvestmentAmount: 1_000_000, landAllocationPct: 20, shortLifeSegregationPct: 25, qualifiesForNonPassiveTreatment: false },
    );
    expect(application.ordinaryDeduction).toBe(0);
  });

  it('produces zero tax savings when suspended as a passive loss, and positive savings when non-passive', () => {
    const scenario = buildScenario({
      termSheet: { dealName: 'd', transactionCosts: 0, allocations: [line('goodwill', 5_000_000, 0)] },
      taxProfile: {
        filingStatus: 'single',
        otherOrdinaryIncome: 0,
        stateName: 'test',
        stateTaxRatePct: 0,
        sellerMateriallyParticipates: true,
      },
    });
    const gainSummary = characterizeGain(scenario);
    const baseline = computeTaxResult(gainSummary, scenario.taxProfile);

    const passive = evaluateStrategy(scenario, gainSummary, baseline, bonusDepreciationRealProperty, {
      reinvestmentAmount: 1_000_000,
      landAllocationPct: 20,
      shortLifeSegregationPct: 25,
      qualifiesForNonPassiveTreatment: false,
    });
    const nonPassive = evaluateStrategy(scenario, gainSummary, baseline, bonusDepreciationRealProperty, {
      reinvestmentAmount: 1_000_000,
      landAllocationPct: 20,
      shortLifeSegregationPct: 25,
      qualifiesForNonPassiveTreatment: true,
    });

    expect(passive.taxSavings).toBe(0);
    expect(nonPassive.taxSavings).toBeGreaterThan(0);
  });
});
