import type { AssetAllocationLine, AssetClass, Scenario } from '../../domain/types';

let idCounter = 0;

export function line(
  assetClass: AssetClass,
  allocatedAmount: number,
  adjustedBasis: number,
  accumulatedDepreciation = 0,
): AssetAllocationLine {
  idCounter += 1;
  return {
    id: `line-${idCounter}`,
    assetClass,
    description: assetClass,
    allocatedAmount,
    adjustedBasis,
    accumulatedDepreciation,
  };
}

export function buildScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    termSheet: {
      dealName: 'Test Deal',
      transactionCosts: 0,
      allocations: [line('goodwill', 1_000_000, 0)],
    },
    ownership: {
      sellerOwnershipPct: 100,
      entityType: 'passthrough',
    },
    earnout: {
      maximumAmount: 0,
      estimatedRealizationPct: 0,
      character: 'capitalGain',
    },
    taxProfile: {
      filingStatus: 'single',
      otherOrdinaryIncome: 0,
      stateName: 'No state income tax',
      stateTaxRatePct: 0,
      sellerMateriallyParticipates: true,
    },
    ...overrides,
  };
}
