import { useMemo, useState } from 'react';
import './App.css';
import { BonusDepreciationStrategyCard } from './components/BonusDepreciationStrategyCard';
import { OwnershipEarnoutSection } from './components/OwnershipEarnoutSection';
import { ResultsSection } from './components/ResultsSection';
import { TaxProfileSection } from './components/TaxProfileSection';
import { TermSheetSection } from './components/TermSheetSection';
import { createDefaultScenario } from './domain/defaults';
import { computeBaseline } from './engine/scenarioEngine';
import { bonusDepreciationRealProperty, type BonusDepreciationParams } from './strategies/bonusDepreciationRealProperty';

function App() {
  const [scenario, setScenario] = useState(createDefaultScenario);
  const [bonusDepEnabled, setBonusDepEnabled] = useState(false);
  const [bonusDepParams, setBonusDepParams] = useState<BonusDepreciationParams>(
    bonusDepreciationRealProperty.createDefaultParams,
  );

  const { gainSummary, taxResult } = useMemo(() => computeBaseline(scenario), [scenario]);

  return (
    <div className="app-shell">
      <header>
        <h1>Business Sale Tax Modeler</h1>
        <p>
          Model the net cash tax impact of an asset sale term sheet, then layer in deferral strategies to see how
          much of the tax bill they offset.
        </p>
      </header>

      <TermSheetSection termSheet={scenario.termSheet} onChange={(termSheet) => setScenario({ ...scenario, termSheet })} />

      <OwnershipEarnoutSection
        ownership={scenario.ownership}
        earnout={scenario.earnout}
        onOwnershipChange={(ownership) => setScenario({ ...scenario, ownership })}
        onEarnoutChange={(earnout) => setScenario({ ...scenario, earnout })}
      />

      <TaxProfileSection taxProfile={scenario.taxProfile} onChange={(taxProfile) => setScenario({ ...scenario, taxProfile })} />

      <ResultsSection gainSummary={gainSummary} taxResult={taxResult} />

      <h2 className="section-heading">Tax Deferral Strategies</h2>
      <BonusDepreciationStrategyCard
        scenario={scenario}
        gainSummary={gainSummary}
        baselineTaxResult={taxResult}
        enabled={bonusDepEnabled}
        params={bonusDepParams}
        onEnabledChange={setBonusDepEnabled}
        onParamsChange={setBonusDepParams}
      />
    </div>
  );
}

export default App;
