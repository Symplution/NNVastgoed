// Het noorden bij valavond, als lagen uit papier: heuvels in steeds donkerder blauw, met de Martinitoren, een molen, een kerk, een hunebed,
// een rij huizen en een flat als silhouet. Alleen de ramen zijn verlicht. Bewust anders dan de felle, vlakke kleuren van een standaard woningsite.
const WARM = '#ffd27d';
const lit = (n: number, i: number) => ((i * 7 + n * 3) % 5 !== 0);

function Windows({ x, y, cols, rows, w = 8, h = 12, gx = 16, gy = 20, seed = 0 }: { x: number; y: number; cols: number; rows: number; w?: number; h?: number; gx?: number; gy?: number; seed?: number }) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(<rect key={`${r}-${c}`} x={x + c * gx} y={y + r * gy} width={w} height={h} rx={2} fill={WARM} opacity={lit(seed + r, c + r * cols) ? 0.95 : 0.12} />);
  return <>{out}</>;
}

function Poplar({ x, base, h, color }: { x: number; base: number; h: number; color: string }) {
  return <g fill={color}><ellipse cx={x} cy={base - h / 2} rx={h * 0.1} ry={h / 2} /><rect x={x - 1.5} y={base - 6} width={3} height={6} /></g>;
}

function House({ x, base, w, h, roof, color, seed }: { x: number; base: number; w: number; h: number; roof: number; color: string; seed: number }) {
  return (
    <g>
      <rect x={x} y={base - h} width={w} height={h} fill={color} />
      <polygon points={`${x - 4},${base - h} ${x + w / 2},${base - h - roof} ${x + w + 4},${base - h}`} fill={color} />
      <Windows x={x + 8} y={base - h + 10} cols={Math.max(1, Math.floor((w - 8) / 20))} rows={Math.max(1, Math.floor((h - 14) / 26))} w={9} h={13} gx={20} gy={26} seed={seed} />
    </g>
  );
}

export function HeroSkyline({ className = '' }: { className?: string }) {
  const far = '#7ba3b8', mid = '#4d7d97', near = '#2c566f', dark = '#1a3c55', front = '#0f2b40';
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 1600 380" className={className} preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="sk-sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff1cf" stopOpacity="1" /><stop offset="0.35" stopColor="#ffd9a0" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
        <linearGradient id="sk-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7c9a0" stopOpacity="0" /><stop offset="1" stopColor="#f7c9a0" stopOpacity="0.45" /></linearGradient>
      </defs>

      {/* zon en wolken */}
      <circle cx="1130" cy="262" r="210" fill="url(#sk-sun)" />
      <circle cx="1130" cy="262" r="46" fill="#fff3d6" />
      <g className="nnv-drift" fill="#fff" opacity="0.22"><ellipse cx="300" cy="96" rx="120" ry="16" /><ellipse cx="370" cy="84" rx="70" ry="14" /><ellipse cx="900" cy="64" rx="150" ry="18" /><ellipse cx="980" cy="52" rx="80" ry="14" /></g>
      <g className="nnv-drift-slow" fill="#fff" opacity="0.16"><ellipse cx="1330" cy="120" rx="130" ry="15" /><ellipse cx="1400" cy="108" rx="64" ry="12" /><ellipse cx="620" cy="140" rx="100" ry="12" /></g>
      <g fill="none" stroke="#1b3550" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"><path d="M740 150q6-7 12 0q6-7 12 0" /><path d="M770 168q5-6 10 0q5-6 10 0" /><path d="M716 176q4-5 8 0q4-5 8 0" /></g>

      {/* ver weg */}
      <path d="M0 292C160 262 320 286 520 270S860 246 1100 276 1440 262 1600 284V380H0Z" fill={far} opacity="0.55" />
      {/* Martinitoren */}
      <g fill={mid} transform="translate(250 0)">
        <rect x="-26" y="196" width="52" height="124" /><rect x="-22" y="146" width="44" height="52" /><rect x="-16" y="108" width="32" height="40" />
        <polygon points="-18,108 0,36 18,108" /><rect x="-1" y="22" width="2" height="16" /><rect x="-6" y="27" width="12" height="2" />
        <circle cx="0" cy="170" r="9" fill="#ffe7b0" opacity="0.95" /><rect x="-5" y="118" width="10" height="18" rx="5" fill={WARM} opacity="0.95" />
        <rect x="-12" y="226" width="9" height="20" rx="4" fill={WARM} opacity="0.9" /><rect x="3" y="226" width="9" height="20" rx="4" fill={WARM} opacity="0.55" />
      </g>
      {/* molen */}
      <g fill={mid} transform="translate(560 0)">
        <polygon points="-30,322 -19,236 19,236 30,322" /><path d="M-19 236a19 19 0 0 1 38 0Z" />
        <g transform="translate(0 232)">{[18, 108, 198, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}><rect x="-2.5" y="-128" width="5" height="128" /><rect x="3" y="-122" width="17" height="74" opacity="0.85" /></g>
        ))}<circle r="6" fill={near} /></g>
        <rect x="-5" y="290" width="10" height="16" rx="5" fill={WARM} opacity="0.9" />
      </g>
      <Poplar x={420} base={310} h={110} color={mid} /><Poplar x={448} base={312} h={90} color={mid} />

      {/* middenlaag */}
      <path d="M0 322C220 296 420 316 640 304S1000 286 1220 308 1480 296 1600 312V380H0Z" fill={mid} opacity="0.95" />
      <rect x="0" y="230" width="1600" height="110" fill="url(#sk-mist)" opacity="0.5" />
      {/* kerk */}
      <g fill={near} transform="translate(900 0)">
        <rect x="-62" y="262" width="124" height="62" /><polygon points="-62,262 0,222 62,262" />
        <polygon points="-76,262 -62,170 -48,262" /><polygon points="48,262 62,170 76,262" /><rect x="-12" y="232" width="24" height="30" /><polygon points="-14,232 0,198 14,232" />
        <rect x="-46" y="276" width="10" height="22" rx="5" fill={WARM} opacity="0.95" /><rect x="-6" y="276" width="12" height="26" rx="6" fill={WARM} opacity="0.95" /><rect x="36" y="276" width="10" height="22" rx="5" fill={WARM} opacity="0.6" />
        <circle cx="0" cy="248" r="4" fill={WARM} />
      </g>
      <Poplar x={760} base={316} h={96} color={near} /><Poplar x={1040} base={314} h={104} color={near} /><Poplar x={1066} base={316} h={80} color={near} />

      {/* huizen en flat rechts */}
      <path d="M0 340C260 322 560 342 820 332S1260 318 1600 336V380H0Z" fill={near} />
      <g fill={dark}>
        <House x={1160} base={336} w={64} h={58} roof={30} color={dark} seed={1} />
        <House x={1232} base={336} w={52} h={72} roof={24} color={dark} seed={2} />
        <House x={1292} base={336} w={70} h={50} roof={34} color={dark} seed={3} />
        <rect x={1380} y={168} width={74} height={168} /><Windows x={1390} y={182} cols={3} rows={6} w={9} h={13} gx={22} gy={26} seed={4} />
        <rect x={1462} y={218} width={70} height={118} /><Windows x={1472} y={230} cols={3} rows={4} w={9} h={13} gx={21} gy={26} seed={6} />
      </g>

      {/* voorgrond met het hunebed */}
      <path d="M0 340C260 316 620 346 940 334S1420 314 1600 330V380H0Z" fill={front} />
      <g fill={front}>
        <rect x="110" y="316" width="24" height="42" rx="4" /><rect x="168" y="318" width="26" height="40" rx="4" /><rect x="236" y="314" width="24" height="44" rx="4" /><rect x="292" y="318" width="24" height="40" rx="4" />
        <rect x="96" y="292" width="124" height="30" rx="14" transform="rotate(-4 158 307)" /><rect x="214" y="294" width="118" height="28" rx="13" transform="rotate(3 273 308)" />
      </g>
      <g stroke="#2d5b78" strokeWidth="1.6" strokeLinecap="round" opacity="0.8"><path d="M106 297l102-9" transform="rotate(-4 158 307)" /><path d="M222 297l100-5" transform="rotate(3 273 308)" /></g>
      <g fill="none" stroke={front} strokeWidth="2.4" strokeLinecap="round"><path d="M40 350q4-14 8 0M60 352q3-18 8 0M360 350q4-16 8 0M384 352q3-12 7 0M720 346q4-14 8 0M1000 342q4-14 8 0" /></g>
      <Poplar x={30} base={350} h={120} color={front} /><Poplar x={1570} base={346} h={130} color={front} />
      {/* pad naar de huizen met de mensen */}
      <path d="M1290 380C1330 356 1360 342 1420 334L1470 336C1440 346 1410 360 1400 380Z" fill="#1d4561" />
      <g fill={front} transform="translate(-118 -6)">
        <circle cx="1388" cy="318" r="7" /><rect x="1380" y="325" width="16" height="30" rx="7" /><rect x="1382" y="352" width="5" height="10" /><rect x="1390" y="352" width="5" height="10" />
        <circle cx="1418" cy="326" r="5.5" /><rect x="1412" y="332" width="12" height="22" rx="6" /><rect x="1413" y="352" width="4" height="9" /><rect x="1419" y="352" width="4" height="9" />
        <circle cx="1445" cy="320" r="7" /><rect x="1437" y="327" width="16" height="30" rx="7" /><rect x="1439" y="354" width="5" height="9" /><rect x="1447" y="354" width="5" height="9" />
        <ellipse cx="1478" cy="352" rx="10" ry="5" /><circle cx="1488" cy="347" r="4" />
      </g>
      <g transform="translate(-118 -6)"><circle cx="1402" cy="340" r="14" fill={WARM} opacity="0.25" /><circle cx="1402" cy="340" r="3.5" fill={WARM} /></g>
      <g fill={WARM}><circle cx="610" cy="352" r="2" opacity="0.8" /><circle cx="690" cy="348" r="1.6" opacity="0.6" /><circle cx="1100" cy="350" r="2" opacity="0.8" /><circle cx="520" cy="346" r="1.5" opacity="0.5" /></g>
    </svg>
  );
}
