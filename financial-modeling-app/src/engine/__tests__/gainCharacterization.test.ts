import { describe, expect, it } from 'vitest';
import { characterizeGain } from '../gainCharacterization';
import { buildScenario, line } from './testHelpers';

describe('characterizeGain', () => {
  it('treats goodwill gain as long-term capital gain', () => {
    const scenario = buildScenario({
      termSheet: { dealName: 'd', transactionCosts: 0, allocations: [line('goodwill', 1_000_000, 0)] },
    });
    const result = characterizeGain(scenario);
    expect(result.longTermCapitalGain).toBe(1_000_000);
    expect(result.ordinaryIncome).toBe(0);
    expect(result.unrecap1250Gain).toBe(0);
  });

  it('caps 1245 recapture at accumulated depreciation, remainder is capital gain', () => {
    const scenario = buildScenario({
      termSheet: {
        dealName: 'd',
        transactionCosts: 0,
        allocations: [line('tangiblePersonalProperty', 800_000, 300_000, 300_000)],
      },
    });
    const result = characterizeGain(scenario);
    // gain = 500,000; accumulated depreciation = 300,000 -> recapture capped at 300,000
    expect(result.ordinaryIncome).toBe(300_000);
    expect(result.longTermCapitalGain).toBe(200_000);
  });

  it('splits 1250 gain into unrecaptured (25%) and regular LTCG layers', () => {
    const scenario = buildScenario({
      termSheet: {
        dealName: 'd',
        transactionCosts: 0,
        allocations: [line('realPropertyBuilding', 1_200_000, 900_000, 250_000)],
      },
    });
    const result = characterizeGain(scenario);
    expect(result.unrecap1250Gain).toBe(250_000);
    expect(result.longTermCapitalGain).toBe(50_000);
  });

  it('does not allocate transaction costs to cash, so cash produces no phantom loss', () => {
    const scenario = buildScenario({
      termSheet: {
        dealName: 'd',
        transactionCosts: 100_000,
        allocations: [line('cash', 100_000, 100_000), line('goodwill', 900_000, 0)],
      },
    });
    const result = characterizeGain(scenario);
    // all 100,000 of transaction costs falls on goodwill (the only non-cash line)
    expect(result.longTermCapitalGain).toBe(800_000);
    expect(result.totalGain).toBe(800_000);
  });

  it('scales proceeds and gain by the seller ownership percentage', () => {
    const scenario = buildScenario({
      termSheet: { dealName: 'd', transactionCosts: 0, allocations: [line('goodwill', 1_000_000, 0)] },
      ownership: { sellerOwnershipPct: 40, entityType: 'passthrough' },
    });
    const result = characterizeGain(scenario);
    expect(result.longTermCapitalGain).toBe(400_000);
    expect(result.totalSellerProceeds).toBe(400_000);
  });

  it('adds the probability-weighted earnout value as additional gain of the chosen character', () => {
    const scenario = buildScenario({
      termSheet: { dealName: 'd', transactionCosts: 0, allocations: [line('goodwill', 1_000_000, 0)] },
      earnout: { maximumAmount: 500_000, estimatedRealizationPct: 60, character: 'ordinaryIncome' },
    });
    const result = characterizeGain(scenario);
    expect(result.ordinaryIncome).toBe(300_000);
    expect(result.longTermCapitalGain).toBe(1_000_000);
    expect(result.sellerProceedsEarnout).toBe(300_000);
  });
});
