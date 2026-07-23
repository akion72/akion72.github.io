import type { GainSummary, TaxResult } from '../domain/types';
import { formatCurrency } from '../utils/formatting';

interface Props {
  gainSummary: GainSummary;
  taxResult: TaxResult;
}

export function ResultsSection({ gainSummary, taxResult }: Props) {
  return (
    <section className="card highlight">
      <h2>Baseline Result — No Deferral Strategies</h2>
      <div className="results-grid">
        <div>
          <h3>Gain by character</h3>
          <dl>
            <div className="dl-row">
              <dt>Ordinary income</dt>
              <dd>{formatCurrency(gainSummary.ordinaryIncome)}</dd>
            </div>
            <div className="dl-row">
              <dt>Unrecaptured §1250 gain (25% cap)</dt>
              <dd>{formatCurrency(gainSummary.unrecap1250Gain)}</dd>
            </div>
            <div className="dl-row">
              <dt>Long-term capital gain</dt>
              <dd>{formatCurrency(gainSummary.longTermCapitalGain)}</dd>
            </div>
            <div className="dl-row total">
              <dt>Total gain (seller's share)</dt>
              <dd>{formatCurrency(gainSummary.totalGain)}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3>Tax</h3>
          <dl>
            <div className="dl-row">
              <dt>Federal ordinary tax</dt>
              <dd>{formatCurrency(taxResult.federalOrdinaryTax)}</dd>
            </div>
            <div className="dl-row">
              <dt>Federal §1250 tax</dt>
              <dd>{formatCurrency(taxResult.federalUnrecap1250Tax)}</dd>
            </div>
            <div className="dl-row">
              <dt>Federal LTCG tax</dt>
              <dd>{formatCurrency(taxResult.federalLtcgTax)}</dd>
            </div>
            <div className="dl-row">
              <dt>Net Investment Income Tax</dt>
              <dd>{formatCurrency(taxResult.federalNIIT)}</dd>
            </div>
            <div className="dl-row">
              <dt>State tax</dt>
              <dd>{formatCurrency(taxResult.stateTax)}</dd>
            </div>
            <div className="dl-row total">
              <dt>Total tax</dt>
              <dd>{formatCurrency(taxResult.totalTax)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="net-cash">
        <span>Net cash after tax (seller's share, before strategies)</span>
        <strong>{formatCurrency(taxResult.netCashAfterTax)}</strong>
      </div>
    </section>
  );
}
