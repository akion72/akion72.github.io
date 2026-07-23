import type { GainSummary, Scenario, TaxResult } from '../domain/types';
import { bonusDepreciationRealProperty, type BonusDepreciationParams } from '../strategies/bonusDepreciationRealProperty';
import { evaluateStrategy } from '../strategies/evaluate';
import { formatCurrency } from '../utils/formatting';

interface Props {
  scenario: Scenario;
  gainSummary: GainSummary;
  baselineTaxResult: TaxResult;
  enabled: boolean;
  params: BonusDepreciationParams;
  onEnabledChange: (enabled: boolean) => void;
  onParamsChange: (params: BonusDepreciationParams) => void;
}

export function BonusDepreciationStrategyCard({
  scenario,
  gainSummary,
  baselineTaxResult,
  enabled,
  params,
  onEnabledChange,
  onParamsChange,
}: Props) {
  const result = enabled
    ? evaluateStrategy(scenario, gainSummary, baselineTaxResult, bonusDepreciationRealProperty, params)
    : null;

  return (
    <section className="card strategy-card">
      <label className="checkbox-row strategy-toggle">
        <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
        <div>
          <h2>{bonusDepreciationRealProperty.label}</h2>
          <p className="hint">{bonusDepreciationRealProperty.description}</p>
        </div>
      </label>

      {enabled && (
        <>
          <div className="field-row">
            <label>
              Real property purchase price
              <input
                type="number"
                value={params.reinvestmentAmount}
                onChange={(e) => onParamsChange({ ...params, reinvestmentAmount: Number(e.target.value) })}
              />
            </label>
            <label>
              Land allocation (%, non-depreciable)
              <input
                type="number"
                min={0}
                max={100}
                value={params.landAllocationPct}
                onChange={(e) => onParamsChange({ ...params, landAllocationPct: Number(e.target.value) })}
              />
            </label>
            <label>
              Cost-seg short-life share of building (%)
              <input
                type="number"
                min={0}
                max={100}
                value={params.shortLifeSegregationPct}
                onChange={(e) => onParamsChange({ ...params, shortLifeSegregationPct: Number(e.target.value) })}
              />
            </label>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={params.qualifiesForNonPassiveTreatment}
              onChange={(e) => onParamsChange({ ...params, qualifiesForNonPassiveTreatment: e.target.checked })}
            />
            Seller qualifies as a real estate professional / materially participates in this rental activity
            (non-passive)
          </label>

          {result && (
            <div className="strategy-result">
              <div className="results-grid">
                <div className="net-cash small">
                  <span>Capital required</span>
                  <strong>{formatCurrency(result.capitalDeployed)}</strong>
                </div>
                <div className="net-cash small">
                  <span>Tax savings</span>
                  <strong>{formatCurrency(result.taxSavings)}</strong>
                </div>
                <div className="net-cash small">
                  <span>Net cash after tax with strategy</span>
                  <strong>{formatCurrency(result.adjustedTaxResult.netCashAfterTax)}</strong>
                </div>
              </div>
              <ul className="notes">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
