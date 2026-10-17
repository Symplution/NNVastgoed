/** Indicatieve maandlast (annuïteit) en kosten koper. Geen advies; dat staat ook in de pagina. */
export function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Overdrachtsbelasting voor een woning om zelf in te wonen (2%). Een ruwe schatting, zonder notaris en taxatie. */
export const transferTax = (price: number) => Math.round(price * 0.02);
