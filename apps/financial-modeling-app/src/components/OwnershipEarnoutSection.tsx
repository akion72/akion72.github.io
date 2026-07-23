import type { Earnout, Ownership } from '../domain/types';

interface Props {
  ownership: Ownership;
  earnout: Earnout;
  onOwnershipChange: (ownership: Ownership) => void;
  onEarnoutChange: (earnout: Earnout) => void;
}

export function OwnershipEarnoutSection({ ownership, earnout, onOwnershipChange, onEarnoutChange }: Props) {
  return (
    <section className="card">
      <h2>Ownership &amp; Earnout</h2>
      <div className="field-row">
        <label>
          Seller's ownership interest (%)
          <input
            type="number"
            min={0}
            max={100}
            value={ownership.sellerOwnershipPct}
            onChange={(e) => onOwnershipChange({ ...ownership, sellerOwnershipPct: Number(e.target.value) })}
          />
        </label>
        <label>
          Selling entity type
          <select
            value={ownership.entityType}
            onChange={(e) => onOwnershipChange({ ...ownership, entityType: e.target.value as Ownership['entityType'] })}
          >
            <option value="passthrough">Pass-through (S-corp / partnership / LLC)</option>
            <option value="cCorp">C corporation</option>
          </select>
        </label>
      </div>
      {ownership.entityType === 'cCorp' && (
        <p className="warning">
          C-corp asset sales face entity-level tax plus a second tax when proceeds are distributed to the
          shareholder. This model only computes the shareholder-level tax shown below — it does not yet add the
          corporate-level tax on the sale itself.
        </p>
      )}

      <div className="field-row">
        <label>
          Earnout maximum amount
          <input
            type="number"
            value={earnout.maximumAmount}
            onChange={(e) => onEarnoutChange({ ...earnout, maximumAmount: Number(e.target.value) })}
          />
        </label>
        <label>
          Estimated realization (%)
          <input
            type="number"
            min={0}
            max={100}
            value={earnout.estimatedRealizationPct}
            onChange={(e) => onEarnoutChange({ ...earnout, estimatedRealizationPct: Number(e.target.value) })}
          />
        </label>
        <label>
          Earnout character
          <select
            value={earnout.character}
            onChange={(e) => onEarnoutChange({ ...earnout, character: e.target.value as Earnout['character'] })}
          >
            <option value="capitalGain">Capital gain (additional purchase price)</option>
            <option value="ordinaryIncome">Ordinary income (compensation-like)</option>
          </select>
        </label>
      </div>
      <p className="hint">
        Modeled as a single probability-weighted amount added to the deal's gain with zero remaining basis (fixed
        consideration is assumed to absorb basis first) — timing of collection across future years is not yet
        separately deferred.
      </p>
    </section>
  );
}
