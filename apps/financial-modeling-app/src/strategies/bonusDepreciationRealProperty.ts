import type { StrategyApplication, StrategyDefinition } from './types';

export interface BonusDepreciationParams {
  reinvestmentAmount: number;
  landAllocationPct: number;
  shortLifeSegregationPct: number;
  qualifiesForNonPassiveTreatment: boolean;
}

export const bonusDepreciationRealProperty: StrategyDefinition<BonusDepreciationParams> = {
  id: 'bonusDepreciationRealProperty',
  label: '100% Bonus Depreciation on Real Property (OBBBA)',
  description:
    'Reinvest sale proceeds into real property, run a cost segregation study to identify ' +
    '5/7/15-year components, and fully expense them in year one under the 100% bonus ' +
    'depreciation permanently restored by the One Big Beautiful Bill Act for qualified ' +
    'property acquired after Jan 19, 2025. The building shell itself (27.5/39-year property) ' +
    'still does not qualify for bonus depreciation — only the segregated short-life components do.',
  createDefaultParams: () => ({
    reinvestmentAmount: 0,
    landAllocationPct: 20,
    shortLifeSegregationPct: 25,
    qualifiesForNonPassiveTreatment: false,
  }),
  apply: (_scenario, _gainSummary, params): StrategyApplication => {
    const depreciableBasis = params.reinvestmentAmount * (1 - params.landAllocationPct / 100);
    const bonusDepreciationDeduction = depreciableBasis * (params.shortLifeSegregationPct / 100);

    if (params.qualifiesForNonPassiveTreatment) {
      return {
        ordinaryDeduction: bonusDepreciationDeduction,
        capitalDeployed: params.reinvestmentAmount,
        notes: [
          `Cost segregation identifies ~$${Math.round(bonusDepreciationDeduction).toLocaleString()} of short-life components, fully expensed in year one.`,
          'Because the seller materially participates (or qualifies as a real estate professional), the loss is non-passive and offsets the sale gain in the current year.',
        ],
      };
    }

    return {
      ordinaryDeduction: 0,
      capitalDeployed: params.reinvestmentAmount,
      notes: [
        `Cost segregation identifies ~$${Math.round(bonusDepreciationDeduction).toLocaleString()} of short-life components, fully expensed in year one.`,
        'Without material participation or real estate professional status, IRC §469 treats this as a passive loss suspended against future passive income — $0 current-year cash tax benefit in this model. It carries forward to offset future passive income or gain on disposition of the property.',
      ],
    };
  },
};
