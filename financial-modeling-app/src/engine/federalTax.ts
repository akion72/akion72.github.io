import type { GainSummary, TaxProfile } from '../domain/types';
import {
  type Bracket,
  LTCG_BRACKETS,
  NIIT_RATE,
  NIIT_THRESHOLD,
  ORDINARY_BRACKETS,
  UNRECAPTURED_1250_RATE,
} from './constants';

/** Tax on a layer of income of size `layerAmount` that sits on top of `stackStart` of other income. */
function taxOnStackedLayer(stackStart: number, layerAmount: number, brackets: Bracket[]): number {
  if (layerAmount <= 0) return 0;
  const layerEnd = stackStart + layerAmount;
  let tax = 0;
  let previousUpTo = 0;
  for (const bracket of brackets) {
    const overlapLow = Math.max(stackStart, previousUpTo);
    const overlapHigh = Math.min(layerEnd, bracket.upTo);
    if (overlapHigh > overlapLow) {
      tax += (overlapHigh - overlapLow) * bracket.rate;
    }
    previousUpTo = bracket.upTo;
  }
  return tax;
}

export interface FederalTaxBreakdown {
  ordinaryTax: number;
  unrecap1250Tax: number;
  ltcgTax: number;
  niit: number;
  total: number;
}

export function computeFederalTax(
  gainSummary: GainSummary,
  taxProfile: TaxProfile,
  ordinaryDeduction = 0,
): FederalTaxBreakdown {
  const ordinaryBrackets = ORDINARY_BRACKETS[taxProfile.filingStatus];
  const ltcgBrackets = LTCG_BRACKETS[taxProfile.filingStatus];

  // A deduction cascades against the highest-taxed layers first: ordinary income,
  // then unrecaptured §1250 gain, then regular LTCG — rather than being wasted
  // whenever it exceeds ordinary income alone.
  let remainingDeduction = ordinaryDeduction;
  const ordinaryIncomeGross = taxProfile.otherOrdinaryIncome + gainSummary.ordinaryIncome;
  const ordinaryTaxableIncome = Math.max(0, ordinaryIncomeGross - remainingDeduction);
  remainingDeduction = Math.max(0, remainingDeduction - ordinaryIncomeGross);

  const unrecap1250AfterDeduction = Math.max(0, gainSummary.unrecap1250Gain - remainingDeduction);
  remainingDeduction = Math.max(0, remainingDeduction - gainSummary.unrecap1250Gain);

  const ltcgAfterDeduction = Math.max(0, gainSummary.longTermCapitalGain - remainingDeduction);

  const ordinaryTax = taxOnStackedLayer(0, ordinaryTaxableIncome, ordinaryBrackets);
  const unrecap1250Tax = unrecap1250AfterDeduction * UNRECAPTURED_1250_RATE;
  const ltcgStackStart = ordinaryTaxableIncome + unrecap1250AfterDeduction;
  const ltcgTax = taxOnStackedLayer(ltcgStackStart, ltcgAfterDeduction, ltcgBrackets);

  const netInvestmentIncome = taxProfile.sellerMateriallyParticipates
    ? 0
    : unrecap1250AfterDeduction + ltcgAfterDeduction;
  const magi = ordinaryTaxableIncome + unrecap1250AfterDeduction + ltcgAfterDeduction;
  const niitThreshold = NIIT_THRESHOLD[taxProfile.filingStatus];
  const niitBase = Math.min(netInvestmentIncome, Math.max(0, magi - niitThreshold));
  const niit = niitBase * NIIT_RATE;

  return {
    ordinaryTax,
    unrecap1250Tax,
    ltcgTax,
    niit,
    total: ordinaryTax + unrecap1250Tax + ltcgTax + niit,
  };
}
