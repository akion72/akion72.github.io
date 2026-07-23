import type { GainSummary, Scenario } from '../domain/types';

/**
 * Characterizes the gain from an asset sale term sheet into the three tax "buckets"
 * that get taxed differently: ordinary income (AR/inventory/covenant/1245 recapture),
 * unrecaptured Section 1250 gain (25% max rate), and regular long-term capital gain.
 * Depreciation recapture is capped at the gain realized on that line (a line can't
 * recognize more recapture than its total gain).
 */
export function characterizeGain(scenario: Scenario): GainSummary {
  const { termSheet, ownership, earnout } = scenario;
  const totalAllocated = termSheet.allocations.reduce((sum, line) => sum + line.allocatedAmount, 0);
  const totalNonCashAllocated = termSheet.allocations
    .filter((line) => line.assetClass !== 'cash')
    .reduce((sum, line) => sum + line.allocatedAmount, 0);

  let ordinaryIncome = 0;
  let unrecap1250Gain = 0;
  let longTermCapitalGain = 0;

  for (const line of termSheet.allocations) {
    // Transaction costs are pro-rated across non-cash lines only — cash has no
    // gain/loss of its own, so allocating fees to it would create a phantom loss.
    const costShare =
      line.assetClass !== 'cash' && totalNonCashAllocated > 0 ? line.allocatedAmount / totalNonCashAllocated : 0;
    const netProceeds = line.allocatedAmount - costShare * termSheet.transactionCosts;
    const gain = netProceeds - line.adjustedBasis;

    switch (line.assetClass) {
      case 'cash':
        break;
      case 'accountsReceivable':
      case 'inventory':
      case 'covenantNotToCompete':
        ordinaryIncome += gain;
        break;
      case 'tangiblePersonalProperty': {
        const recapture = Math.min(Math.max(gain, 0), line.accumulatedDepreciation);
        ordinaryIncome += recapture;
        longTermCapitalGain += gain - recapture;
        break;
      }
      case 'realPropertyBuilding': {
        const unrecap = Math.min(Math.max(gain, 0), line.accumulatedDepreciation);
        unrecap1250Gain += unrecap;
        longTermCapitalGain += gain - unrecap;
        break;
      }
      case 'land':
      case 'goodwill':
      case 'other':
        longTermCapitalGain += gain;
        break;
    }
  }

  const sellerProceedsFixed100 = totalAllocated - termSheet.transactionCosts;

  const estimatedEarnoutValue = earnout.maximumAmount * (earnout.estimatedRealizationPct / 100);
  if (earnout.character === 'capitalGain') {
    longTermCapitalGain += estimatedEarnoutValue;
  } else {
    ordinaryIncome += estimatedEarnoutValue;
  }

  const ownershipShare = ownership.sellerOwnershipPct / 100;
  const sellerProceedsFixed = sellerProceedsFixed100 * ownershipShare;
  const sellerProceedsEarnout = estimatedEarnoutValue * ownershipShare;

  ordinaryIncome *= ownershipShare;
  unrecap1250Gain *= ownershipShare;
  longTermCapitalGain *= ownershipShare;

  return {
    sellerProceedsFixed,
    sellerProceedsEarnout,
    ordinaryIncome,
    unrecap1250Gain,
    longTermCapitalGain,
    totalGain: ordinaryIncome + unrecap1250Gain + longTermCapitalGain,
    totalSellerProceeds: sellerProceedsFixed + sellerProceedsEarnout,
  };
}
