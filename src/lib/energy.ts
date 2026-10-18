import type { EnergyLabel } from './types';

// Kleuren en uitleg per energielabel, voor de label-badge en het infoscherm. De plussen horen bij label A.
export const ENERGY_COLOR: Record<string, { bg: string; fg: string }> = {
  'A++++': { bg: '#2c7a38', fg: '#fff' }, 'A+++': { bg: '#2f8039', fg: '#fff' }, 'A++': { bg: '#33863d', fg: '#fff' }, 'A+': { bg: '#388d40', fg: '#fff' },
  A: { bg: '#3f9142', fg: '#fff' }, B: { bg: '#54ae4e', fg: '#fff' }, C: { bg: '#a9d04a', fg: '#1a2a10' }, D: { bg: '#f6f158', fg: '#33300a' },
  E: { bg: '#ecb53f', fg: '#3a2a05' }, F: { bg: '#d37535', fg: '#fff' }, G: { bg: '#cd3b2d', fg: '#fff' },
};
export const colorFor = (label: EnergyLabel | string) => ENERGY_COLOR[label] ?? { bg: '#8a97a3', fg: '#fff' };
export const letterOf = (label: string) => (label.startsWith('A') ? 'A' : label);

export const ENERGY_EXPLAIN: { letter: string; title: string; text: string }[] = [
  { letter: 'A', title: 'Energielabel A (of hoger)', text: 'Een zeer zuinige woning: uitstekend geïsoleerd, vaak met zonnepanelen of een duurzame verwarming. Je hebt weinig energiekosten en veel comfort. Hoe meer plussen achter de A, hoe zuiniger de woning is.' },
  { letter: 'B', title: 'Energielabel B', text: 'Goed geïsoleerd. Dak, muren en vloeren houden de warmte goed vast, en de ramen hebben meestal hr++-glas in plaats van gewoon dubbel glas.' },
  { letter: 'C', title: 'Energielabel C', text: 'Een gemiddelde, redelijk geïsoleerde woning. Veel Nederlandse huizen hebben label C. De energiekosten zijn redelijk.' },
  { letter: 'D', title: 'Energielabel D', text: 'Matige isolatie. Let op: de cv-ketel kan wat ouder zijn en niet alle ramen hebben dubbel glas. Met een paar maatregelen is een beter label goed haalbaar.' },
  { letter: 'E', title: 'Energielabel E', text: 'Weinig isolatie. Er gaat veel warmte verloren door enkel glas en een oudere verwarming. Dat merk je direct aan hogere energiekosten.' },
  { letter: 'F', title: 'Energielabel F', text: 'Slecht geïsoleerd. Er ontbreken vaak maatregelen als hr-glas, spouw- of dakisolatie en een zuinige ketel, waardoor veel warmte verloren gaat.' },
  { letter: 'G', title: 'Energielabel G', text: 'De minst zuinige klasse. Het kost veel energie om de woning warm te krijgen. Verduurzamen kan lonen, maar vraagt vaak een flinke investering.' },
];
