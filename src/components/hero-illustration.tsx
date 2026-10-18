// Getekende wijk voor de homepage-banner: vlakke vormen met zachte kleurverlopen op een lichte lucht.
// Een vrijstaande woning op een heuvel, een lijntekening van gebouwen erachter, een appartementenblok, een te-koop-bord en wat groen.
// Alleen vormen; decoratief (aria-hidden).
const LINE = '#7a1f14';

function Leaf({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0C-26 -38 -24 -88 0 -118C24 -88 26 -38 0 0Z" fill="url(#hz-leaf)" />
      <path d="M0 0V-96M0 -36L-13 -58M0 -36L13 -58M0 -64L-11 -84M0 -64L11 -84" stroke="#1fae8c" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 1600 340" className={className} preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="hz-orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffa21f" /><stop offset="1" stopColor="#ff6a10" /></linearGradient>
        <linearGradient id="hz-yellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd84d" /><stop offset="1" stopColor="#ffb21f" /></linearGradient>
        <linearGradient id="hz-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4e6" /><stop offset="1" stopColor="#ffd5a3" /></linearGradient>
        <linearGradient id="hz-maroon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a23018" /><stop offset="1" stopColor="#6a1608" /></linearGradient>
        <linearGradient id="hz-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1fb6ff" /><stop offset="1" stopColor="#0079e0" /></linearGradient>
        <linearGradient id="hz-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe98a" /><stop offset="1" stopColor="#ffc23d" /></linearGradient>
        <linearGradient id="hz-mint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fdcae" /><stop offset="1" stopColor="#3dba94" /></linearGradient>
        <linearGradient id="hz-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00b394" /><stop offset="1" stopColor="#006f78" /></linearGradient>
        <linearGradient id="hz-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6f9e4" /><stop offset="1" stopColor="#b9ecc0" /></linearGradient>
      </defs>

      {/* wolken */}
      <g fill="#fff"><rect x="150" y="70" width="170" height="26" rx="13" /><rect x="214" y="48" width="96" height="30" rx="15" /><rect x="720" y="40" width="130" height="22" rx="11" /><rect x="1040" y="96" width="110" height="20" rx="10" opacity=".8" /></g>
      <g fill="#a9dcf7"><rect x="1380" y="52" width="150" height="26" rx="13" /><rect x="1420" y="32" width="86" height="30" rx="15" /></g>

      {/* achtergrond: lijntekening van een flat en een huis */}
      <g transform="translate(0 -12)" fill="none" stroke={LINE} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
        <path d="M770 300V120h96V300M770 160h96M770 200h96M770 240h96M818 120V300" />
        <path d="M784 132h20v16h-20zM832 132h20v16h-20zM784 172h20v16h-20zM832 172h20v16h-20zM784 212h20v16h-20zM832 212h20v16h-20z" />
        <path d="M866 300V196l44-44 44 44V300M886 206h48M886 226h48" />
        <circle cx="910" cy="182" r="9" />
      </g>

      {/* vrijstaande woning */}
      <g transform="translate(0 -62)">
        <rect x="1118" y="196" width="86" height="90" rx="6" fill="url(#hz-orange)" />
        <rect x="1110" y="186" width="102" height="12" rx="6" fill="url(#hz-yellow)" />
        <rect x="1132" y="226" width="58" height="60" rx="4" fill="#fff" opacity=".92" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M1132 ${238 + i * 12}H1190`} stroke="#ff6a10" strokeWidth="2" opacity=".55" />)}
        <rect x="1016" y="158" width="110" height="130" fill="url(#hz-cream)" />
        <polygon points="1000,162 1071,100 1142,162" fill="url(#hz-maroon)" />
        <polygon points="1071,100 1142,162 1071,162" fill="#000" opacity=".12" />
        <polygon points="1078,114 1124,152 1098,152 1078,134" fill="url(#hz-blue)" opacity=".95" />
        <path d="M1090 126l24 20M1082 136l24 18" stroke="#fff" strokeWidth="1.6" opacity=".6" />
        <circle cx="1071" cy="138" r="10" fill="url(#hz-glow)" stroke="#fff" strokeWidth="3" />
        <path d="M1034 232V196a20 20 0 0 1 40 0V232Z" fill="#fff" /><path d="M1039 232V196a15 15 0 0 1 30 0V232Z" fill="url(#hz-glow)" />
        <path d="M1054 182V232M1039 208H1069" stroke="#fff" strokeWidth="3" />
        <path d="M1090 290V236a13 13 0 0 1 26 0V290Z" fill="url(#hz-orange)" /><circle cx="1110" cy="262" r="2.5" fill="#fff" />
      </g>

      {/* appartementen rechts */}
      <g transform="translate(0 -26)">
        <path d="M1310 320V84h86a32 32 0 0 1 32 32V320Z" fill="url(#hz-orange)" />
        <path d="M1310 320V84h36V320Z" fill="url(#hz-cream)" />
        {[0, 1, 2].map((r) => <g key={r}><rect x="1322" y={110 + r * 52} width="14" height="30" rx="7" fill="url(#hz-glow)" /><rect x="1362" y={110 + r * 52} width="20" height="34" rx="10" fill={r === 1 ? 'none' : 'url(#hz-blue)'} stroke={LINE} strokeWidth={r === 1 ? 3 : 0} /><rect x="1396" y={110 + r * 52} width="20" height="34" rx="10" fill="none" stroke={LINE} strokeWidth="3" /></g>)}
        <path d="M1440 320V170a26 26 0 0 1 26-26h98a26 26 0 0 1 26 26V320Z" fill="url(#hz-yellow)" opacity=".0" />
        <path d="M1452 320V190h120V320Z" fill="url(#hz-cream)" /><path d="M1452 190a30 30 0 0 1 30-30h90v30Z" fill="url(#hz-yellow)" />
        <path d="M1512 190H1572V320H1512Z" fill="url(#hz-orange)" />
        {[0, 1].map((r) => <g key={r}><rect x="1466" y={206 + r * 56} width="30" height="38" rx="3" fill="none" stroke={LINE} strokeWidth="3" /><rect x="1524" y={206 + r * 56} width="34" height="38" rx="3" fill="url(#hz-glow)" /></g>)}
        <rect x="1446" y="252" width="86" height="9" rx="3" fill="url(#hz-teal)" />
      </g>

      {/* heuvels */}
      <path d="M0 296C150 248 340 236 530 262C650 279 740 300 860 340H0Z" fill="url(#hz-mint)" />
      <path d="M800 340C890 252 1040 204 1200 208C1350 212 1470 262 1600 340Z" fill="url(#hz-yellow)" />
      <path d="M910 340C990 272 1110 240 1240 246C1340 252 1430 284 1500 340Z" fill="url(#hz-orange)" />
      <path d="M0 340C190 304 420 304 650 324L720 340Z" fill="#fff" opacity=".28" />
      <path d="M1250 340C1300 296 1390 296 1450 340Z" fill="url(#hz-teal)" />
      <path d="M0 340C200 318 420 322 600 334L640 340Z" fill="url(#hz-teal)" opacity=".85" />

      {/* groen en details */}
      <Leaf x={1226} y={272} s={0.9} /><Leaf x={1262} y={286} s={0.7} /><Leaf x={400} y={300} s={1.05} /><Leaf x={160} y={312} s={0.8} />
      <g>
        <rect x="636" y="210" width="6" height="92" rx="2" fill={LINE} /><rect x="636" y="210" width="86" height="6" rx="2" fill={LINE} /><rect x="700" y="216" width="3" height="14" fill={LINE} />
        <path d="M652 232c16-6 40-10 62-6l-8 24c-22-4-42-2-58 6Z" fill="url(#hz-orange)" />
      </g>
      <g transform="translate(1306 304) scale(0.8)">
        <path d="M0 0C-30 -30 -34 -70 -8 -96C-2 -64 0 -34 0 0ZM0 0C34 -34 40 -66 22 -92C8 -64 4 -34 0 0Z" fill="url(#hz-teal)" />
      </g>
      <g transform="translate(1180 292)">
        <ellipse cx="0" cy="2" rx="13" ry="3" fill="#000" opacity=".15" />
        <rect x="-6" y="-28" width="5" height="28" rx="2.5" fill="#2a2f45" /><rect x="1" y="-28" width="5" height="28" rx="2.5" fill="#2a2f45" />
        <rect x="-9" y="-52" width="18" height="28" rx="8" fill="#00b394" />
        <path d="M8 -48q10 6 12 -4" stroke="#f2c6a0" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="0" cy="-62" r="8" fill="#f2c6a0" /><path d="M-8.5 -64Q-7 -74 1 -72Q8 -71 8.5 -64Q3 -68 -2 -66Q-6 -65 -8.5 -64Z" fill="#5a3418" />
        <circle cx="22" cy="-55" r="3" fill="#ffd84d" />
      </g>
    </svg>
  );
}
