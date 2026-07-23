export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}
