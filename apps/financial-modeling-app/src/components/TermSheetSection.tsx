import type { AssetAllocationLine, AssetClass, TermSheet } from '../domain/types';
import { formatCurrency } from '../utils/formatting';

const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  cash: 'Cash',
  accountsReceivable: 'Accounts receivable',
  inventory: 'Inventory',
  tangiblePersonalProperty: 'Tangible personal property (equipment) — §1245',
  realPropertyBuilding: 'Real property: building — §1250',
  land: 'Land',
  goodwill: 'Goodwill / going concern value',
  covenantNotToCompete: 'Covenant not to compete',
  other: 'Other',
};

interface Props {
  termSheet: TermSheet;
  onChange: (termSheet: TermSheet) => void;
}

export function TermSheetSection({ termSheet, onChange }: Props) {
  const updateLine = (id: string, patch: Partial<AssetAllocationLine>) => {
    onChange({
      ...termSheet,
      allocations: termSheet.allocations.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    });
  };

  const addLine = () => {
    onChange({
      ...termSheet,
      allocations: [
        ...termSheet.allocations,
        {
          id: crypto.randomUUID(),
          assetClass: 'other',
          description: '',
          allocatedAmount: 0,
          adjustedBasis: 0,
          accumulatedDepreciation: 0,
        },
      ],
    });
  };

  const removeLine = (id: string) => {
    onChange({ ...termSheet, allocations: termSheet.allocations.filter((line) => line.id !== id) });
  };

  const totalAllocated = termSheet.allocations.reduce((sum, line) => sum + line.allocatedAmount, 0);

  return (
    <section className="card">
      <h2>Term Sheet — Purchase Price Allocation</h2>
      <div className="field-row">
        <label>
          Deal name
          <input
            type="text"
            value={termSheet.dealName}
            onChange={(e) => onChange({ ...termSheet, dealName: e.target.value })}
          />
        </label>
        <label>
          Transaction costs (legal, banker fees)
          <input
            type="number"
            value={termSheet.transactionCosts}
            onChange={(e) => onChange({ ...termSheet, transactionCosts: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Asset class</th>
              <th>Description</th>
              <th>Allocated amount</th>
              <th>Adjusted basis</th>
              <th>Accum. depreciation</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {termSheet.allocations.map((line) => (
              <tr key={line.id}>
                <td>
                  <select
                    value={line.assetClass}
                    onChange={(e) => updateLine(line.id, { assetClass: e.target.value as AssetClass })}
                  >
                    {Object.entries(ASSET_CLASS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => updateLine(line.id, { description: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.allocatedAmount}
                    onChange={(e) => updateLine(line.id, { allocatedAmount: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.adjustedBasis}
                    onChange={(e) => updateLine(line.id, { adjustedBasis: Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={line.accumulatedDepreciation}
                    onChange={(e) => updateLine(line.id, { accumulatedDepreciation: Number(e.target.value) })}
                    disabled={line.assetClass !== 'tangiblePersonalProperty' && line.assetClass !== 'realPropertyBuilding'}
                  />
                </td>
                <td>
                  <button type="button" className="icon-button" onClick={() => removeLine(line.id)} aria-label="Remove line">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total fixed consideration</td>
              <td>{formatCurrency(totalAllocated)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
      <button type="button" className="secondary" onClick={addLine}>
        + Add allocation line
      </button>
    </section>
  );
}
