// Getekende wijk voor de homepage-banner, in lagen voor diepte: verre heuvels en een lijntekening van gebouwen,
// woningen aan een weg die naar de voordeur loopt, en groot groen, lantaarns en een gezin op de voorgrond.
// Vlakke vormen met zachte kleurverlopen op de donkere huiskleur. Alleen vormen en één woord op het bord; decoratief (aria-hidden).
const LINE = '#7a1f14';
const SKY_LINE = '#7a1f14';

function Leaf({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="18" ry="4" fill="#000" opacity=".18" />
      <path d="M0 0C-26 -38 -24 -88 0 -118C24 -88 26 -38 0 0Z" fill="url(#hz-leaf)" />
      <path d="M0 0V-96M0 -36L-13 -58M0 -36L13 -58M0 -64L-11 -84M0 -64L11 -84" stroke="#1fae8c" strokeWidth="2" strokeLinecap="round" fill="none" />
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
      <rect x="-3" y="-120" width="6" height="120" rx="3" fill="#7a1f14" opacity=".9" />
      <path d="M0 -120q0 -14 16 -14" stroke="#7a1f14" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".9" />
      <ellipse cx="22" cy="-132" rx="12" ry="6" fill="#ffe98a" /><ellipse cx="22" cy="-128" rx="26" ry="14" fill="#ffe98a" opacity=".22" />
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

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="60 0 1540 360" className={className} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="hz-orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffa21f" /><stop offset="1" stopColor="#ff6a10" /></linearGradient>
        <linearGradient id="hz-yellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd84d" /><stop offset="1" stopColor="#ffb21f" /></linearGradient>
        <linearGradient id="hz-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4e6" /><stop offset="1" stopColor="#ffd5a3" /></linearGradient>
        <linearGradient id="hz-maroon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a23018" /><stop offset="1" stopColor="#6a1608" /></linearGradient>
        <linearGradient id="hz-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1fb6ff" /><stop offset="1" stopColor="#0079e0" /></linearGradient>
        <linearGradient id="hz-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe98a" /><stop offset="1" stopColor="#ffc23d" /></linearGradient>
        <linearGradient id="hz-mint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fd6a6" /><stop offset="1" stopColor="#2ea483" /></linearGradient>
        <linearGradient id="hz-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1fa382" /><stop offset="1" stopColor="#0d7468" /></linearGradient>
        <linearGradient id="hz-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00b394" /><stop offset="1" stopColor="#006f78" /></linearGradient>
        <linearGradient id="hz-lime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9ec6a" /><stop offset="1" stopColor="#7ccf4e" /></linearGradient>
        <linearGradient id="hz-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6f9e4" /><stop offset="1" stopColor="#b9ecc0" /></linearGradient>
        <linearGradient id="hz-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4e8d2" /><stop offset="1" stopColor="#cdb994" /></linearGradient>
        <linearGradient id="hz-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd3ea" stopOpacity=".9" /><stop offset="1" stopColor="#bfe8f4" stopOpacity=".5" /></linearGradient>
      </defs>

      {/* lucht: zon en wolken */}
      <circle cx="1236" cy="64" r="30" fill="url(#hz-glow)" /><circle cx="1236" cy="64" r="48" fill="#ffd45a" opacity=".16" />
      <g fill="#fff"><g opacity=".95"><rect x="660" y="64" width="150" height="22" rx="11" /><rect x="700" y="46" width="80" height="26" rx="13" /></g><g opacity=".8"><rect x="1290" y="120" width="120" height="18" rx="9" /></g></g>
      <g fill="#a9dcf7" opacity=".9"><rect x="1300" y="52" width="140" height="22" rx="11" /><rect x="1336" y="34" width="76" height="26" rx="13" /></g>

      {/* ver weg: heuvels en een lijntekening van gebouwen */}
      <path d="M560 270C700 214 820 206 960 232C1100 258 1240 214 1380 222C1480 228 1560 246 1600 258V300H560Z" fill="url(#hz-far)" />
      <g fill="none" stroke={SKY_LINE} strokeOpacity=".45" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M790 262V150h70V262M790 180h70M790 210h70M790 238h70M825 150V262" /><path d="M870 262V196l36-34 36 34V262" /><circle cx="906" cy="196" r="7" />
        <path d="M1250 262V170h62V262M1250 198h62M1250 226h62" />
      </g>
      <g fill="#7fcfc4" opacity=".7"><ellipse cx="640" cy="258" rx="30" ry="36" /><ellipse cx="690" cy="262" rx="24" ry="28" /><ellipse cx="1510" cy="254" rx="34" ry="38" /><ellipse cx="1565" cy="258" rx="26" ry="30" /></g>

      {/* appartementen links */}
      <g>
        <path d="M690 290V150h72a24 24 0 0 1 24 24V290Z" fill="url(#hz-orange)" /><path d="M690 290V150h30V290Z" fill="url(#hz-cream)" />
        {[0, 1, 2].map((r) => <g key={r}><rect x="699" y={166 + r * 38} width="12" height="24" rx="6" fill="url(#hz-glow)" /><rect x="730" y={166 + r * 38} width="16" height="26" rx="8" fill={r === 1 ? 'none' : 'url(#hz-blue)'} stroke={LINE} strokeWidth={r === 1 ? 2.5 : 0} /><rect x="756" y={166 + r * 38} width="16" height="26" rx="8" fill="none" stroke={LINE} strokeWidth="2.5" /></g>)}
      </g>

      {/* buurhuis, kleiner en verder weg */}
      <g>
        <rect x="838" y="226" width="64" height="48" fill="url(#hz-cream)" /><polygon points="828,230 870,194 912,230" fill="url(#hz-maroon)" />
        <rect x="850" y="238" width="16" height="18" rx="8" fill="url(#hz-glow)" /><rect x="876" y="248" width="12" height="26" rx="6" fill="url(#hz-orange)" />
      </g>

      {/* vrijstaande woning, aan het eind van de weg */}
      <g transform="translate(-14 -30)">
        <rect x="1118" y="196" width="86" height="90" rx="6" fill="url(#hz-orange)" />
        <rect x="1110" y="186" width="102" height="12" rx="6" fill="url(#hz-yellow)" />
        <rect x="1132" y="226" width="58" height="60" rx="4" fill="#fff" opacity=".92" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M1132 ${238 + i * 12}H1190`} stroke="#ff6a10" strokeWidth="2" opacity=".55" />)}
        <rect x="1016" y="158" width="110" height="130" fill="url(#hz-cream)" />
        <polygon points="1000,162 1071,100 1142,162" fill="url(#hz-maroon)" />
        <polygon points="1071,100 1142,162 1071,162" fill="#000" opacity=".12" />
        <polygon points="1078,114 1124,152 1098,152 1078,134" fill="url(#hz-blue)" opacity=".95" /><path d="M1090 126l24 20M1082 136l24 18" stroke="#fff" strokeWidth="1.6" opacity=".6" />
        <circle cx="1071" cy="138" r="10" fill="url(#hz-glow)" stroke="#fff" strokeWidth="3" />
        <path d="M1034 232V196a20 20 0 0 1 40 0V232Z" fill="#fff" /><path d="M1039 232V196a15 15 0 0 1 30 0V232Z" fill="url(#hz-glow)" /><path d="M1054 182V232M1039 208H1069" stroke="#fff" strokeWidth="3" />
        <path d="M1090 290V236a13 13 0 0 1 26 0V290Z" fill="url(#hz-orange)" /><circle cx="1110" cy="262" r="2.5" fill="#fff" />
      </g>

      {/* appartementen rechts */}
      <g transform="translate(0 -44)">
        <path d="M1310 330V100h86a32 32 0 0 1 32 32V330Z" fill="url(#hz-orange)" /><path d="M1310 330V100h36V330Z" fill="url(#hz-cream)" />
        {[0, 1, 2].map((r) => <g key={r}><rect x="1322" y={126 + r * 52} width="14" height="30" rx="7" fill="url(#hz-glow)" /><rect x="1362" y={126 + r * 52} width="20" height="34" rx="10" fill={r === 1 ? 'none' : 'url(#hz-blue)'} stroke={LINE} strokeWidth={r === 1 ? 3 : 0} /><rect x="1396" y={126 + r * 52} width="20" height="34" rx="10" fill="none" stroke={LINE} strokeWidth="3" /></g>)}
        <path d="M1452 330V210h120V330Z" fill="url(#hz-cream)" /><path d="M1452 210a30 30 0 0 1 30-30h90v30Z" fill="url(#hz-yellow)" /><path d="M1512 210H1572V330H1512Z" fill="url(#hz-orange)" />
        {[0, 1].map((r) => <g key={r}><rect x="1466" y={226 + r * 52} width="30" height="36" rx="3" fill="none" stroke={LINE} strokeWidth="3" /><rect x="1524" y={226 + r * 52} width="34" height="36" rx="3" fill="url(#hz-glow)" /></g>)}
      </g>

      {/* grasland, de weg en het gras op de voorgrond */}
      <path d="M0 304C200 284 420 296 640 276C860 256 1100 262 1300 272C1450 280 1540 274 1600 266V360H0Z" fill="url(#hz-mint)" />
      <path d="M1080 262C1078 296 1040 316 1000 340L962 360H1262C1240 336 1130 316 1104 290C1100 280 1098 272 1100 262Z" fill="url(#hz-road)" />
      <path d="M1090 266C1088 304 1118 322 1124 360" stroke="#fff" strokeWidth="3" strokeDasharray="12 10" strokeLinecap="round" fill="none" opacity=".85" />
      <path d="M1080 262C1078 296 1040 316 1000 340L962 360M1100 262C1098 272 1100 280 1104 290C1130 316 1240 336 1262 360" stroke="#fff" strokeOpacity=".7" strokeWidth="3" fill="none" />
      <path d="M0 336C300 318 700 326 1000 342C1250 354 1450 340 1600 334V360H0Z" fill="url(#hz-grass)" />

      {/* groen en details langs de weg */}
      <Bush x={1050} y={300} r={20} /><Bush x={1160} y={316} r={22} a="hz-teal" b="hz-lime" /><Bush x={980} y={322} r={24} />
      <Leaf x={880} y={290} s={0.62} /><Leaf x={1250} y={300} s={0.85} /><Leaf x={1290} y={312} s={0.6} /><Leaf x={620} y={300} s={0.9} />
      <Lamp x={1005} y={352} s={0.95} /><Lamp x={1118} y={304} s={0.5} />
      <g>{[[1000, 350], [1034, 346], [1190, 350], [1226, 354], [700, 340], [730, 346], [1370, 346]].map(([fx, fy], i) => <g key={i}><path d={`M${fx} ${fy}v-12`} stroke="#0d7468" strokeWidth="2" /><circle cx={fx} cy={fy - 14} r="4.5" fill={['#ffd84d', '#ff8a1f', '#fff'][i % 3]} /></g>)}</g>

      {/* groot groen op de voorgrond, dichtbij en dus groter */}
      <g transform="translate(666 372) scale(1.5)"><path d="M0 0C-34 -36 -40 -84 -8 -118C-2 -80 0 -40 0 0ZM0 0C40 -40 46 -78 26 -110C8 -78 4 -40 0 0ZM0 0C-60 -14 -78 -46 -70 -80C-34 -60 -10 -34 0 0Z" fill="url(#hz-teal)" /><path d="M0 0C-34 -36 -40 -84 -8 -118" stroke="#00d3aa" strokeWidth="2" fill="none" opacity=".5" /></g>
      <g transform="translate(1536 372) scale(1.6)"><path d="M0 0C-36 -36 -42 -86 -8 -120C-2 -82 0 -40 0 0ZM0 0C42 -38 48 -80 28 -112C8 -80 4 -40 0 0ZM0 0C58 -10 82 -40 74 -74C36 -56 10 -32 0 0Z" fill="url(#hz-teal)" /></g>
      <Bush x={1440} y={340} r={30} /><Bush x={590} y={346} r={28} a="hz-teal" b="hz-lime" />

      {/* gezin en hond op het gras */}
      <g>
        <Person x={1332} y={352} s={1.05} skin="#f2c6a0" shirt="#fff" pants="#2a2f45" hair="#5a3418" />
        <Person x={1380} y={354} s={0.66} skin="#c98a5e" shirt="#ff7a1a" pants="#2f6fa8" hair="#2b1a10" />
        <Person x={1426} y={352} s={1} skin="#8d5a3c" shirt="#e8447c" pants="#3a3550" hair="#1c1410" />
        <g transform="translate(1472 354)"><ellipse cx="0" cy="1" rx="18" ry="3" fill="#000" opacity=".22" /><ellipse cx="0" cy="-14" rx="16" ry="9" fill="#e8963a" /><circle cx="15" cy="-22" r="8" fill="#e8963a" /><path d="M20 -28l7 -3l-2 9z" fill="#b8701f" /><rect x="-11" y="-9" width="4" height="10" rx="2" fill="#c9792a" /><rect x="6" y="-9" width="4" height="10" rx="2" fill="#c9792a" /><path d="M-16 -17q-9 -8 -5 -18" stroke="#e8963a" strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="18" cy="-24" r="1.6" fill="#2a1a10" /></g>
      </g>
    </svg>
  );
}
