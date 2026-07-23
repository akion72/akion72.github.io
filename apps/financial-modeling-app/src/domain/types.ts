export type AssetClass =
  | 'cash'
  | 'accountsReceivable'
  | 'inventory'
  | 'tangiblePersonalProperty'
  | 'realPropertyBuilding'
  | 'land'
  | 'goodwill'
  | 'covenantNotToCompete'
  | 'other';

export interface AssetAllocationLine {
  id: string;
  assetClass: AssetClass;
  description: string;
  allocatedAmount: number;
  adjustedBasis: number;
  accumulatedDepreciation: number;
}

export interface TermSheet {
  dealName: string;
  allocations: AssetAllocationLine[];
  transactionCosts: number;
}

export type EntityType = 'passthrough' | 'cCorp';

export interface Ownership {
  sellerOwnershipPct: number;
  entityType: EntityType;
}

export type EarnoutCharacter = 'capitalGain' | 'ordinaryIncome';

export interface Earnout {
  maximumAmount: number;
  estimatedRealizationPct: number;
  character: EarnoutCharacter;
}

export type FilingStatus = 'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold';

export interface TaxProfile {
  filingStatus: FilingStatus;
  otherOrdinaryIncome: number;
  stateName: string;
  stateTaxRatePct: number;
  sellerMateriallyParticipates: boolean;
}

export interface Scenario {
  termSheet: TermSheet;
  ownership: Ownership;
  earnout: Earnout;
  taxProfile: TaxProfile;
}

export interface GainSummary {
  sellerProceedsFixed: number;
  sellerProceedsEarnout: number;
  ordinaryIncome: number;
  unrecap1250Gain: number;
  longTermCapitalGain: number;
  totalGain: number;
  totalSellerProceeds: number;
}

export interface TaxResult {
  federalOrdinaryTax: number;
  federalUnrecap1250Tax: number;
  federalLtcgTax: number;
  federalNIIT: number;
  federalTaxTotal: number;
  stateTax: number;
  totalTax: number;
  netCashAfterTax: number;
}

export interface BaselineResult {
  gainSummary: GainSummary;
  taxResult: TaxResult;
}

export interface IncomeAdjustment {
  /** Reduces the ordinary-income stacking layer (e.g. a depreciation deduction). Positive number = deduction amount. */
  ordinaryDeduction: number;
}

export interface StrategyResult {
  strategyId: string;
  label: string;
  capitalDeployed: number;
  taxSavings: number;
  adjustedTaxResult: TaxResult;
  notes: string[];
}
