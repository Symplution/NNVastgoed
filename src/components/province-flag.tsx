import type { Province } from '@/lib/types';

const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.4 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }).join(' ');

// Een pompeblêd: een rond blad met een inkeping bovenin.
const LEAF = 'M0 -9C-5 -26 -34 -24 -34 -2C-34 20 -14 33 0 34C14 33 34 20 34 -2C34 -24 5 -26 0 -9Z';

/** Groningen: rood linksboven en rechtsonder, blauw de andere twee hoeken, een groen kruis op wit. Verhouding 3:2. */
function Groningen() {
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <path fill="#fff" d="M0 0h600v400H0z" />
      <path stroke="#078930" strokeWidth="52" d="M0 200h600M300 0v400" />
      <path stroke="#da121a" strokeWidth="130" d="M0 64h227m146 272h227" />
      <path stroke="#0f47af" strokeWidth="130" d="M0 336h227M373 64h227" />
    </svg>
  );
}

/** Friesland: vier blauwe en drie witte schuine banen met zeven rode pompeblêden (drie in het midden, twee in de buitenste witte banen). */
function Friesland() {
  const T = 56;   // dikte van een baan
  const band = (i: number) => -3.5 * T + i * T;
  const leaf = (x: number, y: number) => <path key={`${x}-${y}`} d={LEAF} fill="#e52329" transform={`translate(${x} ${y}) rotate(-12) scale(.95)`} />;
  return (
    <svg viewBox="0 0 538 371" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <rect width="538" height="371" fill="#fff" />
      <g transform="translate(269 185.5) rotate(34.6)">
        {[0, 2, 4, 6].map((i) => <rect key={i} x="-500" y={band(i)} width="1000" height={T} fill="#21468b" />)}
        {[-150, 0, 150].map((x) => leaf(x, 0))}
        {[-75, 75].map((x) => leaf(x, -2 * T))}
        {[-75, 75].map((x) => leaf(x, 2 * T))}
      </g>
    </svg>
  );
}

/** Drenthe: wit met twee rode banen; in het midden een zwarte toren (kasteel van Coevorden) met aan elke kant drie rode sterren. */
function Drenthe() {
  return (
    <svg viewBox="0 0 547 371" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <rect width="547" height="371" fill="#fff" />
      <rect y="80" width="547" height="43" fill="#d9121b" /><rect y="243" width="547" height="43" fill="#d9121b" />
      {[55, 115, 172, 372, 432, 490].map((x) => <polygon key={x} points={star(x, 183, 25)} fill="#d9121b" />)}
      <path fill="#000" d="M232 140h22v14h12v-14h14v14h12v-14h22v34h-12v22h12v31H232v-31h12v-22h-12z" />
      <path fill="#fff" d="M262 225v-22a11 11 0 0 1 22 0v22z" />
    </svg>
  );
}

/** De vlag van de provincie, die het vak waarin hij staat helemaal vult (het midden van de vlag blijft zichtbaar). */
export function ProvinceFlag({ province, className = '' }: { province: Province; className?: string }) {
  return (
    <span aria-hidden className={`block overflow-hidden ${className}`}>
      {province === 'groningen' ? <Groningen /> : province === 'friesland' ? <Friesland /> : <Drenthe />}
    </span>
  );
}
