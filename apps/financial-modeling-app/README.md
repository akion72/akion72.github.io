# Business Sale Tax Modeler

A standalone React/TypeScript app (not part of the Jekyll site build) that models the
net cash-after-tax impact of an asset sale of a business, then layers in tax
deferral strategies to show how much of the tax bill they offset.

## Flow

1. **Term sheet** — enter the Form 8594-style purchase price allocation (cash, AR,
   inventory, equipment, building, land, covenant not to compete, goodwill) with each
   line's adjusted basis and accumulated depreciation, plus transaction costs.
2. **Ownership & earnout** — the seller's ownership percentage (scales their share of
   everything) and a probability-weighted earnout estimate.
3. **Individual tax situation** — filing status, other stacked income, state rate, and
   whether the seller materially participated in the business (drives NIIT exposure).
4. **Baseline result** — gain split into ordinary income / unrecaptured §1250 gain /
   long-term capital gain, federal + state tax, and net cash after tax with no
   strategies applied.
5. **Strategies** — toggle deferral strategies on to see capital required, tax
   savings, and the resulting net cash after tax. First strategy: 100% bonus
   depreciation on real property (via cost segregation) under the bonus depreciation
   rules permanently restored by the One Big Beautiful Bill Act (OBBBA) for qualified
   property acquired after Jan 19, 2025.

## Key simplifying assumptions

These are deliberate v1 simplifications, not oversights — flagged here so they're
easy to revisit as the model grows:

- **Federal brackets** are the 2025 ordinary-income and LTCG/qualified-dividend
  brackets (post-OBBBA permanent TCJA rates). Not inflation-adjusted for other years.
- **State tax** is a single flat marginal rate applied to total gain, not a real
  bracket schedule per state (most states tax capital gains as ordinary income, so
  this is a reasonable approximation, not a real per-state engine).
- **Unrecaptured §1250 gain** is taxed at a flat 25% rather than
  `min(25%, marginal ordinary rate)` — accurate once the seller is already in the
  25%+ bracket, which is the common case for a gain this size.
- **NIIT (3.8%)** is applied to the deal's capital-gain-type income only when the
  seller is marked as *not* materially participating, per the §1411(c)(4) active
  trade-or-business exception. Other investment income outside the deal isn't
  modeled.
- **C-corp asset sales**: only the shareholder-level tax is computed. The
  entity-level tax on the sale itself (the double-tax problem) isn't modeled yet —
  the UI flags this when a C-corp entity type is selected.
- **Earnout** is modeled as a single probability-weighted amount (`max × est. %`)
  added to the deal's gain in one lump, assumed to have zero remaining basis. Timing
  of collection across future years (and the time value of deferral) isn't modeled.
- **A strategy's ordinary deduction cascades** against the highest-taxed layers
  first — ordinary income, then unrecaptured §1250 gain, then regular LTCG — rather
  than being wasted once it exceeds ordinary income alone.
- **Passive activity loss rules (§469)** are modeled for the bonus depreciation
  strategy via a single toggle ("qualifies for non-passive treatment"): unchecked,
  the deduction produces $0 current-year benefit (suspended loss); checked, it
  offsets the sale gain in the current year. Real-world REPS/material participation
  qualification, grouping elections, and the $25k active-participation allowance
  aren't separately modeled.

## Development

```bash
npm install
npm run dev      # start the dev server, served at /financial-modeling-app/
npm run test     # run the vitest suite for the tax engine
npm run build    # typecheck + production build
```

## Publishing

This source lives at `apps/financial-modeling-app/` (excluded from the Jekyll build
via `_config.yml`'s `exclude:`), and the site is deployed the classic Jekyll way
(no build step runs on GitHub's side), so the **compiled** output has to be
committed to the repo separately, at the top-level `financial-modeling-app/`
directory, which Jekyll copies through untouched as static files:

```bash
cd apps/financial-modeling-app
npm run build
rm -rf ../../financial-modeling-app
mkdir -p ../../financial-modeling-app
cp -r dist/. ../../financial-modeling-app/
```

`vite.config.ts` sets `base: '/financial-modeling-app/'` so the built asset URLs
resolve correctly once the domain root serves the site. After committing both the
source changes and the refreshed `financial-modeling-app/` output, the app is live
at `https://akion72.github.io/financial-modeling-app/` once merged to `master`.

## Architecture

- `src/domain/types.ts` — scenario, term sheet, and result types.
- `src/engine/` — gain characterization (`gainCharacterization.ts`), federal tax
  (`federalTax.ts`), state tax (`stateTax.ts`), and the top-level
  `scenarioEngine.ts` that ties them together.
- `src/strategies/` — a small plugin interface (`types.ts`) so new deferral
  strategies can be added as a `StrategyDefinition` without touching the engine;
  `evaluate.ts` re-runs the engine with a strategy's deduction applied and diffs
  against baseline to get tax savings.
- `src/components/` — form sections and results display.
