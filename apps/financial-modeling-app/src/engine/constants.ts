import type { FilingStatus } from '../domain/types';

export interface Bracket {
  rate: number;
  upTo: number;
}

// 2025 federal ordinary income brackets (IRS Rev. Proc. 2024-40, post-OBBBA permanent TCJA rates).
export const ORDINARY_BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { rate: 0.10, upTo: 11_925 },
    { rate: 0.12, upTo: 48_475 },
    { rate: 0.22, upTo: 103_350 },
    { rate: 0.24, upTo: 197_300 },
    { rate: 0.32, upTo: 250_525 },
    { rate: 0.35, upTo: 626_350 },
    { rate: 0.37, upTo: Infinity },
  ],
  marriedJoint: [
    { rate: 0.10, upTo: 23_850 },
    { rate: 0.12, upTo: 96_950 },
    { rate: 0.22, upTo: 206_700 },
    { rate: 0.24, upTo: 394_600 },
    { rate: 0.32, upTo: 501_050 },
    { rate: 0.35, upTo: 751_600 },
    { rate: 0.37, upTo: Infinity },
  ],
  marriedSeparate: [
    { rate: 0.10, upTo: 11_925 },
    { rate: 0.12, upTo: 48_475 },
    { rate: 0.22, upTo: 103_350 },
    { rate: 0.24, upTo: 197_300 },
    { rate: 0.32, upTo: 250_525 },
    { rate: 0.35, upTo: 375_800 },
    { rate: 0.37, upTo: Infinity },
  ],
  headOfHousehold: [
    { rate: 0.10, upTo: 17_000 },
    { rate: 0.12, upTo: 64_850 },
    { rate: 0.22, upTo: 103_350 },
    { rate: 0.24, upTo: 197_300 },
    { rate: 0.32, upTo: 250_500 },
    { rate: 0.35, upTo: 626_350 },
    { rate: 0.37, upTo: Infinity },
  ],
};

// 2025 long-term capital gains / qualified dividend brackets.
export const LTCG_BRACKETS: Record<FilingStatus, Bracket[]> = {
  single: [
    { rate: 0.0, upTo: 48_350 },
    { rate: 0.15, upTo: 533_400 },
    { rate: 0.20, upTo: Infinity },
  ],
  marriedJoint: [
    { rate: 0.0, upTo: 96_700 },
    { rate: 0.15, upTo: 600_050 },
    { rate: 0.20, upTo: Infinity },
  ],
  marriedSeparate: [
    { rate: 0.0, upTo: 48_350 },
    { rate: 0.15, upTo: 300_000 },
    { rate: 0.20, upTo: Infinity },
  ],
  headOfHousehold: [
    { rate: 0.0, upTo: 64_750 },
    { rate: 0.15, upTo: 566_700 },
    { rate: 0.20, upTo: Infinity },
  ],
};

export const NIIT_RATE = 0.038;

export const NIIT_THRESHOLD: Record<FilingStatus, number> = {
  single: 200_000,
  marriedJoint: 250_000,
  marriedSeparate: 125_000,
  headOfHousehold: 200_000,
};

// Simplification: unrecaptured Section 1250 gain is taxed at a flat 25% rather than
// min(25%, marginal ordinary rate) — accurate for any seller already in the 25%+ bracket,
// which is the common case for a business-sale gain of this size.
export const UNRECAPTURED_1250_RATE = 0.25;

export const STATE_TOP_RATE_PRESETS: { name: string; ratePct: number }[] = [
  { name: 'No state income tax (e.g. TX, FL, WA, NV, TN, SD, WY, AK)', ratePct: 0 },
  { name: 'North Carolina', ratePct: 4.5 },
  { name: 'Arizona', ratePct: 2.5 },
  { name: 'Georgia', ratePct: 5.39 },
  { name: 'Massachusetts', ratePct: 9.0 },
  { name: 'New York', ratePct: 10.9 },
  { name: 'New Jersey', ratePct: 10.75 },
  { name: 'California', ratePct: 13.3 },
  { name: 'Custom', ratePct: 0 },
];
