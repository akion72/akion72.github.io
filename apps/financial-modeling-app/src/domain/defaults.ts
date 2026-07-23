import type { Scenario } from './types';

function line(
  assetClass: Scenario['termSheet']['allocations'][number]['assetClass'],
  description: string,
  allocatedAmount: number,
  adjustedBasis: number,
  accumulatedDepreciation = 0,
) {
  return {
    id: crypto.randomUUID(),
    assetClass,
    description,
    allocatedAmount,
    adjustedBasis,
    accumulatedDepreciation,
  };
}

export function createDefaultScenario(): Scenario {
  return {
    termSheet: {
      dealName: 'Sample Asset Sale',
      transactionCosts: 150_000,
      allocations: [
        line('cash', 'Cash on hand', 100_000, 100_000),
        line('accountsReceivable', 'Accounts receivable', 300_000, 300_000),
        line('inventory', 'Inventory', 200_000, 150_000),
        line('tangiblePersonalProperty', 'Equipment & machinery', 800_000, 300_000, 500_000),
        line('realPropertyBuilding', 'Building', 1_200_000, 900_000, 250_000),
        line('land', 'Land', 400_000, 250_000),
        line('covenantNotToCompete', 'Covenant not to compete', 100_000, 0),
        line('goodwill', 'Goodwill / going concern value', 6_000_000, 0),
      ],
    },
    ownership: {
      sellerOwnershipPct: 100,
      entityType: 'passthrough',
    },
    earnout: {
      maximumAmount: 1_000_000,
      estimatedRealizationPct: 50,
      character: 'capitalGain',
    },
    taxProfile: {
      filingStatus: 'marriedJoint',
      otherOrdinaryIncome: 250_000,
      stateName: 'California',
      stateTaxRatePct: 13.3,
      sellerMateriallyParticipates: true,
    },
  };
}
