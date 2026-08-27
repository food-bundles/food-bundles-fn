/**
 * Formats an amount as Rwandan Francs using a manual "RWF" suffix rather
 * than Intl.NumberFormat's currency style, which renders RWF as the
 * narrow symbol "RF" on runtimes whose bundled ICU data lacks a spelled-out
 * mapping for this currency in the en-RW locale.
 */
export function formatRwf(amount: number): string {
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} RWF`;
}
