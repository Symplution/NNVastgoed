// Getekend noorden voor de homepage-banner, in lagen voor diepte: het hunebed (Drenthe), de Martinitoren (Groningen), een molen
// en de Waterpoort van Sneek (Friesland), woningen aan een weg, een gezin, planten, wolken en de zon.
// Vlakke vormen met zachte kleurverlopen. Alleen vormen; decoratief (aria-hidden).
const LINE = '#2f3d4c';
const SKY_LINE = '#2f3d4c';

function Leaf({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="18" ry="4" fill="#000" opacity=".18" />
      <path d="M0 0C-26 -38 -24 -88 0 -118C24 -88 26 -38 0 0Z" fill="url(#hz-leaf)" />
      <path d="M0 0V-96M0 -36L-13 -58M0 -36L13 -58M0 -64L-11 -84M0 -64L11 -84" stroke="#5f9a76" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}
function Bush({ x, y, r = 22, a = 'hz-lime', b = 'hz-teal' }: { x: number; y: number; r?: number; a?: string; b?: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y + r * 0.55} rx={r * 1.25} ry={r * 0.22} fill="#000" opacity=".2" />
      <ellipse cx={x - r * 0.45} cy={y} rx={r * 0.8} ry={r * 0.75} fill={`url(#${b})`} />
      <ellipse cx={x + r * 0.4} cy={y - r * 0.1} rx={r * 0.85} ry={r * 0.85} fill={`url(#${a})`} />
    </g>
  );
}
function Lamp({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-120" width="6" height="120" rx="3" fill="#2f3d4c" opacity=".9" />
      <path d="M0 -120q0 -14 16 -14" stroke="#2f3d4c" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".9" />
      <ellipse cx="22" cy="-132" rx="12" ry="6" fill="#fbe9a8" /><ellipse cx="22" cy="-128" rx="26" ry="14" fill="#fbe9a8" opacity=".22" />
    </g>
  );
}
function Person({ x, y, s = 1, skin, shirt, pants, hair }: { x: number; y: number; s?: number; skin: string; shirt: string; pants: string; hair: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#000" opacity=".25" />
      <rect x="-8" y="-34" width="6.5" height="34" rx="3" fill={pants} /><rect x="1.5" y="-34" width="6.5" height="34" rx="3" fill={pants} />
      <rect x="-11" y="-62" width="22" height="34" rx="9" fill={shirt} />
      <path d="M-10 -56Q-17 -42 -13 -30M10 -56Q17 -42 13 -30" stroke={skin} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="-73" r="10" fill={skin} /><path d="M-10.5 -75Q-9 -87 1 -85Q10 -84 10.5 -75Q4 -80 -3 -78Q-8 -77 -10.5 -75Z" fill={hair} />
    </g>
  );
}


const CREAM = '#f6ead3';

/** Martinitoren, Groningen. Oorsprong: midden van de voet. */
function Martinitoren({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="46" ry="6" fill="#000" opacity=".16" />
      <rect x="-30" y="-72" width="60" height="72" fill="url(#hz-brick)" />
      <rect x="-26" y="-132" width="52" height="62" fill="url(#hz-brick)" />
      <rect x="-21" y="-172" width="42" height="42" fill="url(#hz-brick)" />
      <rect x="-15" y="-204" width="30" height="34" fill="url(#hz-brick)" />
      <g fill={CREAM}><rect x="-33" y="-76" width="66" height="7" rx="2" /><rect x="-29" y="-136" width="58" height="6" rx="2" /><rect x="-24" y="-176" width="48" height="6" rx="2" /><rect x="-18" y="-208" width="36" height="6" rx="2" /></g>
      <path d="M-19 -208L0 -262L19 -208Z" fill="url(#hz-maroon)" />
      <circle cx="0" cy="-221" r="11" fill={CREAM} /><path d="M-11 -221H11M0 -232V-210" stroke="#2f3d4c" strokeWidth="1.6" opacity=".7" />
      <circle cx="0" cy="-267" r="5.2" fill="#2f3d4c" /><circle cx="-1.6" cy="-268.6" r="1.5" fill="#fff" opacity=".35" />
      <g fill="url(#hz-blue)"><path d="M-21 -20V-46a7 7 0 0 1 14 0V-20Z" /><path d="M7 -20V-46a7 7 0 0 1 14 0V-20Z" /></g>
      <path d="M-9 0V-24a9 9 0 0 1 18 0V0Z" fill="url(#hz-orange)" />
      <g fill="url(#hz-glow)"><path d="M-18 -92V-112a5 5 0 0 1 10 0V-92Z" /><path d="M8 -92V-112a5 5 0 0 1 10 0V-92Z" /></g>
      <circle cx="0" cy="-152" r="9" fill={CREAM} stroke="#2f3d4c" strokeWidth="2" /><path d="M0 -158V-152L5 -150" stroke="#2f3d4c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <g fill="url(#hz-glow)"><path d="M-10 -181V-196a4 4 0 0 1 8 0V-181Z" /><path d="M2 -181V-196a4 4 0 0 1 8 0V-181Z" /></g>
    </g>
  );
}

/** Waterpoort, Sneek (Friesland). Oorsprong: midden van de voet. */
function Waterpoort({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="12" rx="92" ry="8" fill="#000" opacity=".12" />
      <rect x="-90" y="2" width="180" height="16" rx="8" fill="url(#hz-blue)" /><path d="M-70 10q6-5 12 0t12 0t12 0M20 10q6-5 12 0t12 0t12 0" stroke="#fff" strokeWidth="2" fill="none" opacity=".55" strokeLinecap="round" />
      <rect x="-66" y="-92" width="34" height="94" fill="url(#hz-brick)" /><rect x="32" y="-92" width="34" height="94" fill="url(#hz-brick)" />
      <polygon points="-70,-92 -49,-160 -28,-92" fill="url(#hz-maroon)" /><polygon points="28,-92 49,-160 70,-92" fill="url(#hz-maroon)" />
      <g stroke="#2f3d4c" strokeWidth="2" strokeLinecap="round"><path d="M-49 -160V-172M49 -160V-172" /></g>
      <rect x="-34" y="-82" width="68" height="84" fill="url(#hz-cream)" />
      <path d="M-38 -82L0 -118L38 -82Z" fill="url(#hz-maroon)" /><path d="M-24 -86L0 -108L24 -86Z" fill={CREAM} opacity=".35" />
      <rect x="-10" y="-138" width="20" height="24" fill="url(#hz-brick)" /><path d="M-13 -138L0 -164L13 -138Z" fill="url(#hz-maroon)" /><circle cx="0" cy="-126" r="6" fill={CREAM} />
      <path d="M-26 2V-34a12 12 0 0 1 24 0V2Z" fill="#d8e9ef" /><path d="M2 2V-34a12 12 0 0 1 24 0V2Z" fill="#d8e9ef" />
      <path d="M-26 2V-34a12 12 0 0 1 24 0V2Z" fill="url(#hz-blue)" opacity=".5" /><path d="M2 2V-34a12 12 0 0 1 24 0V2Z" fill="url(#hz-blue)" opacity=".5" />
      <g fill="url(#hz-glow)"><rect x="-58" y="-70" width="10" height="16" rx="5" /><rect x="-58" y="-44" width="10" height="16" rx="5" /><rect x="48" y="-70" width="10" height="16" rx="5" /><rect x="48" y="-44" width="10" height="16" rx="5" /></g>
      <g fill={CREAM}><rect x="-70" y="-96" width="42" height="5" rx="2" /><rect x="28" y="-96" width="42" height="5" rx="2" /></g>
    </g>
  );
}

/** Molen. Oorsprong: midden van de voet. */
function Molen({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="46" ry="6" fill="#000" opacity=".16" />
      <polygon points="-28,0 28,0 16,-98 -16,-98" fill="url(#hz-cream)" />
      <polygon points="0,0 28,0 16,-98 0,-98" fill="#000" opacity=".08" />
      <rect x="-36" y="-36" width="72" height="8" rx="3" fill="url(#hz-maroon)" /><rect x="-34" y="0" width="68" height="0" />
      <path d="M-9 0V-18a9 9 0 0 1 18 0V0Z" fill="url(#hz-orange)" /><rect x="-5" y="-66" width="10" height="16" rx="5" fill="url(#hz-blue)" />
      <path d="M-19 -98Q0 -128 19 -98Z" fill="url(#hz-maroon)" />
      <g transform="translate(0 -100)">
        {[18, 108, 198, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1="0" y1="0" x2="84" y2="0" stroke="#2f3d4c" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="22" y="-9" width="62" height="18" rx="2" fill={CREAM} stroke="#2f3d4c" strokeWidth="2" />
            <path d="M34 -9V9M46 -9V9M58 -9V9M70 -9V9M22 0H84" stroke="#2f3d4c" strokeWidth="1.4" opacity=".7" />
          </g>
        ))}
        <circle cx="0" cy="0" r="6" fill="url(#hz-orange)" stroke="#2f3d4c" strokeWidth="2" />
      </g>
    </g>
  );
}

/** Hunebed (Drenthe). Oorsprong: midden van de voet. */
function Hunebed({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="4" rx="96" ry="9" fill="#000" opacity=".2" />
      <g fill="url(#hz-stone)">
        <rect x="-62" y="-56" width="22" height="58" rx="9" transform="rotate(-3 -51 -27)" /><rect x="-26" y="-50" width="22" height="52" rx="9" /><rect x="14" y="-52" width="22" height="54" rx="9" /><rect x="50" y="-44" width="20" height="46" rx="9" transform="rotate(4 60 -22)" />
        <rect x="-74" y="-76" width="94" height="28" rx="13" transform="rotate(-4 -27 -62)" /><rect x="-2" y="-68" width="82" height="26" rx="12" transform="rotate(5 39 -55)" />
      </g>
      <g fill="#fff" opacity=".3"><rect x="-66" y="-70" width="40" height="7" rx="3.5" transform="rotate(-4 -46 -66)" /><rect x="8" y="-62" width="34" height="6" rx="3" transform="rotate(5 25 -59)" /></g>
      <g fill="#8e7bb5">{[[-90, 0], [-80, 4], [84, 2], [96, -2], [-100, 4], [106, 4]].map(([hx, hy], i) => <circle key={i} cx={hx} cy={hy} r="3.2" />)}</g>
      <path d="M-86 4q-3-14 2-22M88 4q4-14 -1-22M-96 6q-4-10 0-16" stroke="#86bd6f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  );
}

/** Een woning in een rij. */
function RowHouse({ x, y, w = 42, h = 62, body, roof, roofShape = 'punt' }: { x: number; y: number; w?: number; h?: number; body: string; roof: string; roofShape?: 'punt' | 'trap' }) {
  const top = y - h;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h + 6} fill={`url(#${body})`} />
      {roofShape === 'punt' ? <polygon points={`${x - 3},${top} ${x + w / 2},${top - 26} ${x + w + 3},${top}`} fill={`url(#${roof})`} /> : <g fill={`url(#${body})`}><rect x={x + 3} y={top - 8} width={w - 6} height="8" /><rect x={x + 8} y={top - 15} width={w - 16} height="7" /></g>}
      <rect x={x + 6} y={top + 10} width="11" height="15" rx="5.5" fill="url(#hz-glow)" /><rect x={x + w - 17} y={top + 10} width="11" height="15" rx="5.5" fill="url(#hz-blue)" />
      <rect x={x + w / 2 - 5} y={y - 20} width="10" height="26" rx="5" fill="url(#hz-orange)" />
    </g>
  );
}

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="60 0 1540 360" className={className} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="hz-orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cf7a58" /><stop offset="1" stopColor="#a9482f" /></linearGradient>
        <linearGradient id="hz-yellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6dd8f" /><stop offset="1" stopColor="#e8bd55" /></linearGradient>
        <linearGradient id="hz-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8f0e1" /><stop offset="1" stopColor="#e8d6b4" /></linearGradient>
        <linearGradient id="hz-maroon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#66788a" /><stop offset="1" stopColor="#3e4d5e" /></linearGradient>
        <linearGradient id="hz-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8fc1d6" /><stop offset="1" stopColor="#4a89ab" /></linearGradient>
        <linearGradient id="hz-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbe9a8" /><stop offset="1" stopColor="#f0c75a" /></linearGradient>
        <linearGradient id="hz-mint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9cf9a" /><stop offset="1" stopColor="#6ea36a" /></linearGradient>
        <linearGradient id="hz-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86bd6f" /><stop offset="1" stopColor="#4f8f4f" /></linearGradient>
        <linearGradient id="hz-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6aa371" /><stop offset="1" stopColor="#2f6b4a" /></linearGradient>
        <linearGradient id="hz-lime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4e594" /><stop offset="1" stopColor="#98c25a" /></linearGradient>
        <linearGradient id="hz-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eaf3de" /><stop offset="1" stopColor="#c9e0b2" /></linearGradient>
        <linearGradient id="hz-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1e6cc" /><stop offset="1" stopColor="#d3bf95" /></linearGradient>
        <linearGradient id="hz-brick" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bb5a3f" /><stop offset="1" stopColor="#8a3a28" /></linearGradient>
        <linearGradient id="hz-stone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d3dce4" /><stop offset="1" stopColor="#8e9eae" /></linearGradient>
        <linearGradient id="hz-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9ecbd9" stopOpacity=".9" /><stop offset="1" stopColor="#cbe2e9" stopOpacity=".5" /></linearGradient>
      </defs>

      {/* lucht: zon en wolken */}
      <circle cx="262" cy="92" r="30" fill="url(#hz-glow)" /><circle cx="262" cy="92" r="48" fill="#f2d27a" opacity=".2" />
      <g fill="#fff"><g opacity=".95"><rect x="130" y="124" width="150" height="22" rx="11" /><rect x="166" y="106" width="80" height="26" rx="13" /></g><g opacity=".95"><rect x="700" y="60" width="150" height="22" rx="11" /><rect x="740" y="42" width="80" height="26" rx="13" /></g><g opacity=".8"><rect x="1010" y="96" width="120" height="18" rx="9" /></g></g>
      <g fill="#b8d8e5" opacity=".9"><rect x="1300" y="56" width="140" height="22" rx="11" /><rect x="1336" y="38" width="76" height="26" rx="13" /></g>

      {/* ver weg: heuvels */}
      <path d="M60 262C200 224 330 232 470 250C600 266 760 214 900 232C1040 250 1240 214 1380 222C1480 228 1560 246 1600 258V300H60Z" fill="url(#hz-far)" />
      <g fill="#8cbfae" opacity=".7"><ellipse cx="130" cy="262" rx="30" ry="34" /><ellipse cx="1510" cy="254" rx="34" ry="38" /><ellipse cx="1565" cy="258" rx="26" ry="30" /></g>

      {/* de bekende bouwwerken van het noorden */}
      <Martinitoren x={430} y={282} s={0.98} />
      <Molen x={606} y={284} s={0.98} />
      <Waterpoort x={792} y={284} s={0.92} />

      {/* woningen in een rij */}
      <RowHouse x={884} y={284} body="hz-orange" roof="hz-maroon" /><RowHouse x={928} y={284} h={74} body="hz-cream" roof="hz-maroon" roofShape="trap" /><RowHouse x={972} y={284} h={58} body="hz-yellow" roof="hz-maroon" />

      {/* vrijstaande woning, aan het eind van de weg */}
      <g transform="translate(46 -30)">
        <rect x="1118" y="196" width="86" height="90" rx="6" fill="url(#hz-orange)" />
        <rect x="1110" y="186" width="102" height="12" rx="6" fill="url(#hz-yellow)" />
        <rect x="1132" y="226" width="58" height="60" rx="4" fill="#fff" opacity=".92" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M1132 ${238 + i * 12}H1190`} stroke="#a9482f" strokeWidth="2" opacity=".55" />)}
        <rect x="1016" y="158" width="110" height="130" fill="url(#hz-cream)" />
        <polygon points="1000,162 1071,100 1142,162" fill="url(#hz-maroon)" />
        <polygon points="1071,100 1142,162 1071,162" fill="#000" opacity=".12" />
        <polygon points="1078,114 1124,152 1098,152 1078,134" fill="url(#hz-blue)" opacity=".95" /><path d="M1090 126l24 20M1082 136l24 18" stroke="#fff" strokeWidth="1.6" opacity=".6" />
        <circle cx="1071" cy="138" r="10" fill="url(#hz-glow)" stroke="#fff" strokeWidth="3" />
        <path d="M1034 232V196a20 20 0 0 1 40 0V232Z" fill="#fff" /><path d="M1039 232V196a15 15 0 0 1 30 0V232Z" fill="url(#hz-glow)" /><path d="M1054 182V232M1039 208H1069" stroke="#fff" strokeWidth="3" />
        <path d="M1090 290V236a13 13 0 0 1 26 0V290Z" fill="url(#hz-orange)" /><circle cx="1110" cy="262" r="2.5" fill="#fff" />
      </g>

      {/* appartementen rechts */}
      <g transform="translate(-20 -44)">
        <path d="M1310 330V100h86a32 32 0 0 1 32 32V330Z" fill="url(#hz-orange)" /><path d="M1310 330V100h36V330Z" fill="url(#hz-cream)" />
        {[0, 1, 2].map((r) => <g key={r}><rect x="1322" y={126 + r * 52} width="14" height="30" rx="7" fill="url(#hz-glow)" /><rect x="1362" y={126 + r * 52} width="20" height="34" rx="10" fill={r === 1 ? 'none' : 'url(#hz-blue)'} stroke={LINE} strokeWidth={r === 1 ? 3 : 0} /><rect x="1396" y={126 + r * 52} width="20" height="34" rx="10" fill="none" stroke={LINE} strokeWidth="3" /></g>)}
        <path d="M1452 330V210h120V330Z" fill="url(#hz-cream)" /><path d="M1452 210a30 30 0 0 1 30-30h90v30Z" fill="url(#hz-yellow)" /><path d="M1512 210H1572V330H1512Z" fill="url(#hz-orange)" />
        {[0, 1].map((r) => <g key={r}><rect x="1466" y={226 + r * 52} width="30" height="36" rx="3" fill="none" stroke={LINE} strokeWidth="3" /><rect x="1524" y={226 + r * 52} width="34" height="36" rx="3" fill="url(#hz-glow)" /></g>)}
      </g>

      {/* grasland, de weg en het gras op de voorgrond */}
      <path d="M0 282C200 272 420 276 640 272C860 266 1100 262 1300 272C1450 280 1540 274 1600 266V360H0Z" fill="url(#hz-mint)" />
      <g transform="translate(60 0)">
      <path d="M1080 262C1078 296 1040 316 1000 340L962 360H1262C1240 336 1130 316 1104 290C1100 280 1098 272 1100 262Z" fill="url(#hz-road)" />
      <path d="M1090 266C1088 304 1118 322 1124 360" stroke="#fff" strokeWidth="3" strokeDasharray="12 10" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M1080 262C1078 296 1040 316 1000 340L962 360M1100 262C1098 272 1100 280 1104 290C1130 316 1240 336 1262 360" stroke="#fff" strokeOpacity=".7" strokeWidth="3" fill="none" />
      </g>
      <path d="M0 336C300 318 700 326 1000 342C1250 354 1450 340 1600 334V360H0Z" fill="url(#hz-grass)" />

      {/* groen en details langs de weg */}
      <g transform="translate(60 0)">
        <Bush x={1050} y={300} r={20} /><Bush x={1160} y={316} r={22} a="hz-teal" b="hz-lime" /><Bush x={980} y={322} r={24} />
        <Lamp x={1005} y={352} s={0.95} /><Lamp x={1118} y={304} s={0.5} />
        <g>{[[1000, 350], [1034, 346], [1190, 350], [1226, 354]].map(([fx, fy], i) => <g key={i}><path d={`M${fx} ${fy}v-12`} stroke="#4f8f4f" strokeWidth="2" /><circle cx={fx} cy={fy - 14} r="4.5" fill={['#f6dd8f', '#c9694a', '#fff'][i % 3]} /></g>)}</g>
      </g>
      <Leaf x={1318} y={300} s={0.85} /><Leaf x={1352} y={312} s={0.6} /><Leaf x={548} y={298} s={0.7} /><Leaf x={702} y={296} s={0.6} /><Leaf x={860} y={296} s={0.6} />
      <Bush x={760} y={300} r={16} /><Bush x={560} y={304} r={18} a="hz-teal" b="hz-lime" />

      {/* het hunebed van Drenthe, dichtbij en dus groot */}
      <Hunebed x={250} y={332} s={1.15} />
      <Leaf x={392} y={332} s={1.0} /><Leaf x={110} y={340} s={0.8} />

      {/* groot groen op de voorgrond, dichtbij en dus groter */}
      <g transform="translate(40 372) scale(1.5)"><path d="M0 0C-34 -36 -40 -84 -8 -118C-2 -80 0 -40 0 0ZM0 0C40 -40 46 -78 26 -110C8 -78 4 -40 0 0ZM0 0C-60 -14 -78 -46 -70 -80C-34 -60 -10 -34 0 0Z" fill="url(#hz-teal)" /><path d="M0 0C-34 -36 -40 -84 -8 -118" stroke="#7ab88f" strokeWidth="2" fill="none" opacity=".5" /></g>
      <g transform="translate(1536 372) scale(1.6)"><path d="M0 0C-36 -36 -42 -86 -8 -120C-2 -82 0 -40 0 0ZM0 0C42 -38 48 -80 28 -112C8 -80 4 -40 0 0ZM0 0C58 -10 82 -40 74 -74C36 -56 10 -32 0 0Z" fill="url(#hz-teal)" /></g>
      <Bush x={1440} y={340} r={30} /><Bush x={470} y={346} r={26} a="hz-teal" b="hz-lime" />

      {/* gezin en hond op het gras */}
      <g>
        <Person x={1332} y={352} s={1.05} skin="#f2c6a0" shirt="#fff" pants="#2a2f45" hair="#5a3418" />
        <Person x={1380} y={354} s={0.66} skin="#c98a5e" shirt="#b85a3d" pants="#2f6fa8" hair="#2b1a10" />
        <Person x={1426} y={352} s={1} skin="#8d5a3c" shirt="#d9604f" pants="#3a3550" hair="#1c1410" />
        <g transform="translate(1472 354)"><ellipse cx="0" cy="1" rx="18" ry="3" fill="#000" opacity=".22" /><ellipse cx="0" cy="-14" rx="16" ry="9" fill="#d9a066" /><circle cx="15" cy="-22" r="8" fill="#d9a066" /><path d="M20 -28l7 -3l-2 9z" fill="#9b6a35" /><rect x="-11" y="-9" width="4" height="10" rx="2" fill="#b07a3e" /><rect x="6" y="-9" width="4" height="10" rx="2" fill="#b07a3e" /><path d="M-16 -17q-9 -8 -5 -18" stroke="#d9a066" strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="18" cy="-24" r="1.6" fill="#2a1a10" /></g>
      </g>
    </svg>
  );
}
