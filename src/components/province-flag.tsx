import type { Province } from '@/lib/types';

const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.4 : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join(' ');

const HEART = 'M0 -3.5C3.5 -8.5 9.5 -3.5 5.5 1.5L0 7L-5.5 1.5C-9.5 -3.5 -3.5 -8.5 0 -3.5Z';

/** De vlag van de provincie, getekend voor in een cirkel (het middelste vierkant van de vlag blijft zichtbaar). */
function Flag({ province }: { province: Province }) {
  if (province === 'groningen') {
    // Rood links boven en rechts onder, blauw de andere twee; een wit kruis (1/3 van de hoogte) met daarin een groen kruis (1/9).
    return (
      <>
        <rect width="90" height="60" fill="#005eb8" />
        <rect width="45" height="30" fill="#ef3340" /><rect x="45" y="30" width="45" height="30" fill="#ef3340" />
        <rect x="35" width="20" height="60" fill="#fff" /><rect y="20" width="90" height="20" fill="#fff" />
        <rect x="41.67" width="6.67" height="60" fill="#009639" /><rect y="26.67" width="90" height="6.67" fill="#009639" />
      </>
    );
  }
  if (province === 'friesland') {
    // Vier blauwe en drie witte schuine banen met zeven rode pompeblêden.
    return (
      <>
        <rect width="90" height="60" fill="#fff" />
        <g transform="rotate(33.7 45 30)">
          {[0, 2, 4, 6].map((i) => <rect key={i} x="-40" y={-8.5 + 11 * i} width="170" height="11" fill="#21468b" />)}
          {[[1, [36, 54]], [3, [27, 45, 63]], [5, [36, 54]]].map(([band, xs]) => (xs as number[]).map((x) => <path key={`${band}-${x}`} d={HEART} fill="#e0282e" transform={`translate(${x} ${-8.5 + 11 * (band as number) + 5.5}) rotate(180) scale(.85)`} />))}
        </g>
      </>
    );
  }
  // Drenthe: wit met twee rode banen, in het midden een zwarte toren (kasteel van Coevorden) met aan elke kant drie rode sterren.
  return (
    <>
      <rect width="90" height="60" fill="#fff" />
      <rect width="90" height="13" fill="#d71920" /><rect y="47" width="90" height="13" fill="#d71920" />
      <rect x="39" y="22" width="12" height="25" fill="#111" /><rect x="39" y="18" width="3" height="5" fill="#111" /><rect x="43.5" y="18" width="3" height="5" fill="#111" /><rect x="48" y="18" width="3" height="5" fill="#111" />
      <rect x="43" y="28" width="4" height="7" rx="2" fill="#fff" />
      {[[22, 22], [28, 32], [22, 42], [68, 22], [62, 32], [68, 42]].map(([x, y]) => <polygon key={`${x}-${y}`} points={star(x, y, 4.6)} fill="#d71920" />)}
    </>
  );
}

export function ProvinceFlag({ province, className = '' }: { province: Province; className?: string }) {
  return (
    <span aria-hidden className={`inline-block aspect-square overflow-hidden rounded-full ring-1 ring-black/10 ${className}`}>
      <svg viewBox="15 0 60 60" preserveAspectRatio="xMidYMid slice" className="block h-full w-full"><Flag province={province} /></svg>
    </span>
  );
}
