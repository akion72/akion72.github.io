import type { FilingStatus, TaxProfile } from '../domain/types';
import { STATE_TOP_RATE_PRESETS } from '../engine/constants';

interface Props {
  taxProfile: TaxProfile;
  onChange: (taxProfile: TaxProfile) => void;
}

const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  marriedJoint: 'Married filing jointly',
  marriedSeparate: 'Married filing separately',
  headOfHousehold: 'Head of household',
};

export function TaxProfileSection({ taxProfile, onChange }: Props) {
  return (
    <section className="card">
      <h2>Individual Tax Situation</h2>
      <div className="field-row">
        <label>
          Filing status
          <select
            value={taxProfile.filingStatus}
            onChange={(e) => onChange({ ...taxProfile, filingStatus: e.target.value as FilingStatus })}
          >
            {Object.entries(FILING_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Other ordinary income (stacks below the deal)
          <input
            type="number"
            value={taxProfile.otherOrdinaryIncome}
            onChange={(e) => onChange({ ...taxProfile, otherOrdinaryIncome: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="field-row">
        <label>
          State (top marginal rate preset)
          <select
            value={taxProfile.stateName}
            onChange={(e) => {
              const preset = STATE_TOP_RATE_PRESETS.find((s) => s.name === e.target.value);
              onChange({
                ...taxProfile,
                stateName: e.target.value,
                stateTaxRatePct: preset && preset.name !== 'Custom' ? preset.ratePct : taxProfile.stateTaxRatePct,
              });
            }}
          >
            {STATE_TOP_RATE_PRESETS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          State tax rate (%)
          <input
            type="number"
            step={0.1}
            value={taxProfile.stateTaxRatePct}
            onChange={(e) => onChange({ ...taxProfile, stateTaxRatePct: Number(e.target.value) })}
          />
        </label>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={taxProfile.sellerMateriallyParticipates}
          onChange={(e) => onChange({ ...taxProfile, sellerMateriallyParticipates: e.target.checked })}
        />
        Seller materially participated in the business (active operator, not a passive investor)
      </label>
      <p className="hint">
        This determines whether the sale gain is exposed to the 3.8% Net Investment Income Tax — IRC §1411
        excludes gain from disposing of property used in an active (non-passive) trade or business.
      </p>
    </section>
  );
}
