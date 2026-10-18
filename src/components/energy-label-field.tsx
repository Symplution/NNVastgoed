'use client';

import { useState } from 'react';
import { ENERGY_LABELS } from '@/lib/types';
import { EnergyLabelWithInfo } from './energy-label';
import { Select } from './select';

/** Het energielabel kiezen in het woningformulier: je ziet meteen het label met zijn kleur, met de uitleg erachter. */
export function EnergyLabelField({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <label htmlFor="energy_label" className="label">Energielabel</label>
      <Select id="energy_label" name="energy_label" value={value} onChange={setValue} options={[{ value: '', label: 'Onbekend' }, ...ENERGY_LABELS.map((e) => ({ value: e, label: e }))]} />
      <div className="mt-2 min-h-9">{value ? <EnergyLabelWithInfo label={value} size="lg" /> : <p className="text-xs text-muted">Kies een label om te zien hoe het eruitziet.</p>}</div>
    </div>
  );
}
