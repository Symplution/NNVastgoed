// De regels van de usage gate (los van de database, zodat ze testbaar zijn).
export interface GateInput { monthCount: number; hourCount: number; monthLimit: number; hourLimit: number }
export type GateVerdict = 'ok' | 'maandbudget' | 'uurlimiet';

export function evaluateGate(g: GateInput): GateVerdict {
  if (g.monthCount >= g.monthLimit) return 'maandbudget';
  if (g.hourCount >= g.hourLimit) return 'uurlimiet';
  return 'ok';
}

