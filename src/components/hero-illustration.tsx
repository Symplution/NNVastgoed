// Getekende wijk voor de homepage: een vrijstaande woning met een gezin ervoor, een te-koop-bord, appartementen en wat groen.
// Alleen vormen en één woord op het bord; decoratief (aria-hidden).
const SKIN = ['#f2c6a0', '#c98a5e', '#8d5a3c'];

function Person({ x, y, s = 1, skin, shirt, pants, hair, reach = 0 }: { x: number; y: number; s?: number; skin: string; shirt: string; pants: string; hair: string; reach?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#000" opacity=".18" />
      <rect x="-8" y="-34" width="6.5" height="34" rx="3" fill={pants} /><rect x="1.5" y="-34" width="6.5" height="34" rx="3" fill={pants} />
      <rect x="-11" y="-62" width="22" height="34" rx="9" fill={shirt} />
      <path d={`M-10 -56 Q-17 -42 -${13 - reach} -30`} stroke={skin} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d={`M10 -56 Q17 -42 ${13 + reach} -30`} stroke={skin} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="-73" r="10" fill={skin} /><path d="M-10.5 -75 Q-9 -87 1 -85 Q10 -84 10.5 -75 Q4 -80 -3 -78 Q-8 -77 -10.5 -75Z" fill={hair} />
    </g>
  );
}

function Tree({ x, y, r, a = '#2fb39a', b = '#1f8f86' }: { x: number; y: number; r: number; a?: string; b?: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 2} rx={r * 0.8} ry="4" fill="#000" opacity=".12" />
      <rect x={x - 3} y={y - r * 0.9} width="6" height={r * 0.9} rx="2" fill="#7a3b1e" />
      <circle cx={x} cy={y - r * 1.35} r={r} fill={`url(#${a === '#2fb39a' ? 'hv-teal' : 'hv-lime'})`} />
      <circle cx={x + r * 0.35} cy={y - r * 1.1} r={r * 0.55} fill={b} opacity=".35" />
    </g>
  );
}

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 760 330" className={className} preserveAspectRatio="xMaxYMax meet">
      <defs>
        <linearGradient id="hv-orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb02e" /><stop offset="1" stopColor="#ff7a1a" /></linearGradient>
        <linearGradient id="hv-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe27a" /><stop offset="1" stopColor="#ffc233" /></linearGradient>
        <linearGradient id="hv-cream" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff8ec" /><stop offset="1" stopColor="#ffe6c4" /></linearGradient>
        <linearGradient id="hv-roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a5381a" /><stop offset="1" stopColor="#6e1f0c" /></linearGradient>
        <linearGradient id="hv-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0a8" /><stop offset="1" stopColor="#ffbf3d" /></linearGradient>
        <linearGradient id="hv-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#35b2ff" /><stop offset="1" stopColor="#0c78d6" /></linearGradient>
        <linearGradient id="hv-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fd0ae" /><stop offset="1" stopColor="#14917f" /></linearGradient>
        <linearGradient id="hv-lime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9ec6a" /><stop offset="1" stopColor="#7ccf4e" /></linearGradient>
        <linearGradient id="hv-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e07a3c" /><stop offset="1" stopColor="#bd5524" /></linearGradient>
        <linearGradient id="hv-fade" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".07" stopColor="#fff" /><stop offset=".95" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id="hv-mask"><rect width="760" height="330" fill="url(#hv-fade)" /></mask>
      </defs>
      <g mask="url(#hv-mask)">
        {/* zon en wolken */}
        <circle cx="660" cy="58" r="30" fill="url(#hv-sun)" /><circle cx="660" cy="58" r="46" fill="#ffd45a" opacity=".16" />
        <g fill="#fff"><g opacity=".92"><rect x="86" y="52" width="104" height="22" rx="11" /><rect x="112" y="36" width="58" height="26" rx="13" /></g><g opacity=".7"><rect x="430" y="30" width="120" height="20" rx="10" /><rect x="462" y="16" width="56" height="24" rx="12" /></g><g opacity=".5"><rect x="250" y="90" width="80" height="14" rx="7" /><rect x="598" y="116" width="90" height="14" rx="7" /></g></g>
        <path d="M312 40 q6 -7 12 0 q6 -7 12 0 M356 66 q5 -6 10 0 q5 -6 10 0" stroke="#fff" strokeWidth="2" fill="none" opacity=".7" strokeLinecap="round" />

        {/* achtergrond: lijntekening van een flat en een rijtje */}
        <g fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinejoin="round">
          <path d="M150 262V110h74V262" /><path d="M162 126h16v16h-16zM196 126h16v16h-16zM162 164h16v16h-16zM196 164h16v16h-16zM162 202h16v16h-16zM196 202h16v16h-16z" />
          <path d="M600 262V132l44-28 44 28V262" /><path d="M616 160h16v16h-16zM654 160h16v16h-16zM616 198h16v16h-16zM654 198h16v16h-16z" />
        </g>

        {/* appartementen links en rechts */}
        <g>
          <rect x="46" y="150" width="96" height="112" rx="10" fill="url(#hv-orange)" />
          <rect x="46" y="150" width="30" height="112" rx="10" fill="#fff" opacity=".22" />
          {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={84 + c * 28} y={164 + r * 32} width="18" height="20" rx="9" fill={(r + c) % 2 ? 'url(#hv-glass)' : 'url(#hv-glow)'} />))}
          <rect x="40" y="144" width="108" height="10" rx="5" fill="#ffd45a" />
        </g>
        <g>
          <rect x="688" y="136" width="62" height="126" rx="10" fill="url(#hv-teal)" />
          {[0, 1, 2].map((r) => <g key={r}><rect x="700" y={150 + r * 36} width="14" height="24" rx="7" fill="url(#hv-glow)" /><rect x="724" y={150 + r * 36} width="14" height="24" rx="7" fill="url(#hv-glass)" /></g>)}
          <rect x="682" y="130" width="74" height="10" rx="5" fill="#fff" opacity=".85" />
        </g>

        {/* vrijstaande woning */}
        <g>
          <ellipse cx="410" cy="266" rx="190" ry="10" fill="#000" opacity=".14" />
          <rect x="468" y="196" width="94" height="66" rx="6" fill="url(#hv-teal)" /><rect x="462" y="190" width="106" height="9" rx="4.5" fill="#0f6b63" />
          <rect x="482" y="212" width="66" height="50" rx="4" fill="#fff" opacity=".92" />{[0, 1, 2, 3].map((i) => <path key={i} d={`M482 ${222 + i * 11}H548`} stroke="#14917f" strokeWidth="2" opacity=".5" />)}
          <rect x="316" y="148" width="158" height="114" fill="url(#hv-cream)" />
          <rect x="316" y="148" width="52" height="114" fill="url(#hv-wood)" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${326 + i * 9} 150V262`} stroke="#8a3410" strokeWidth="1.4" opacity=".35" />)}
          <polygon points="296,152 402,84 490,152" fill="url(#hv-roof)" />
          <polygon points="402,84 490,152 402,152" fill="#000" opacity=".12" />
          <g transform="rotate(32 430 120)"><rect x="410" y="104" width="58" height="26" rx="3" fill="url(#hv-glass)" />{[1, 2, 3].map((i) => <path key={i} d={`M${410 + i * 14.5} 104V130`} stroke="#fff" strokeWidth="1.4" opacity=".6" />)}<path d="M410 117H468" stroke="#fff" strokeWidth="1.4" opacity=".6" /></g>
          <rect x="342" y="92" width="20" height="40" rx="3" fill="#8a2f14" /><rect x="338" y="88" width="28" height="8" rx="3" fill="#6e1f0c" />
          <circle cx="396" cy="128" r="11" fill="url(#hv-glow)" stroke="#fff" strokeWidth="3" />
          <rect x="384" y="168" width="76" height="62" rx="4" fill="#fff" /><rect x="389" y="173" width="66" height="52" rx="2" fill="url(#hv-glow)" />
          <path d="M422 173V225M389 199H455" stroke="#fff" strokeWidth="3" />
          <path d="M395 225 q8 -22 14 -2 q6 -26 12 2Z" fill="#7a3b1e" opacity=".55" /><rect x="438" y="182" width="3" height="43" fill="#7a3b1e" opacity=".5" /><path d="M432 182h15l-3 -10h-9z" fill="#ffd45a" opacity=".8" />
          <rect x="328" y="206" width="30" height="56" rx="14" fill="#14506b" /><circle cx="352" cy="236" r="2.5" fill="#ffd45a" /><circle cx="343" cy="219" r="6" fill="url(#hv-glow)" opacity=".9" />
          <circle cx="371" cy="214" r="4" fill="#ffd45a" /><circle cx="371" cy="214" r="9" fill="#ffd45a" opacity=".25" />
          <path d="M342 262 L330 330 H440 L388 262Z" fill="#ffe9c8" opacity=".9" />
        </g>

        {/* groen, niet te veel */}
        <Tree x={222} y={266} r={22} /><Tree x={600} y={266} r={20} a="#c9ec6a" b="#4f9f3a" />
        <g><ellipse cx="312" cy="270" rx="16" ry="9" fill="url(#hv-lime)" /><ellipse cx="578" cy="270" rx="20" ry="11" fill="url(#hv-teal)" /></g>

        {/* te-koop-bord */}
        <g>
          <rect x="264" y="226" width="5" height="40" rx="2" fill="#7a3b1e" /><rect x="294" y="226" width="5" height="40" rx="2" fill="#7a3b1e" />
          <rect x="254" y="214" width="52" height="26" rx="5" fill="#fff" /><rect x="254" y="214" width="52" height="8" rx="4" fill="url(#hv-orange)" />
          <text x="280" y="234" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="7.5" fontWeight="800" fill="#14506b" letterSpacing=".4">VERKOCHT</text>
        </g>

        {/* gezin */}
        <g>
          <Person x={392} y={304} s={1.02} skin={SKIN[0]} shirt="#14506b" pants="#2a2f45" hair="#5a3418" reach={7} />
          <Person x={446} y={306} s={0.64} skin={SKIN[1]} shirt="#ff7a1a" pants="#2f6fa8" hair="#2b1a10" reach={5} />
          <Person x={500} y={304} s={0.98} skin={SKIN[2]} shirt="#e8447c" pants="#3a3550" hair="#1c1410" reach={7} />
          <g transform="translate(540 306)">
            <ellipse cx="0" cy="1" rx="18" ry="3" fill="#000" opacity=".16" />
            <ellipse cx="0" cy="-14" rx="16" ry="9" fill="#e8963a" /><circle cx="15" cy="-22" r="8" fill="#e8963a" /><path d="M20 -28 l7 -3 l-2 9z" fill="#b8701f" />
            <rect x="-11" y="-9" width="4" height="10" rx="2" fill="#c9792a" /><rect x="6" y="-9" width="4" height="10" rx="2" fill="#c9792a" /><path d="M-16 -17 q-9 -8 -5 -18" stroke="#e8963a" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="18" cy="-24" r="1.6" fill="#2a1a10" />
          </g>
        </g>

        {/* heuvels onderin */}
        <path d="M0 292c70-26 150-28 230-10s170 24 260 8 170-22 270-4v44H0z" fill="#ffd45a" />
        <path d="M0 308c110-20 210-20 330-8s250 10 430-6v36H0z" fill="url(#hv-teal)" />
        <path d="M0 322c140-10 300-12 460-6s220 2 300-2v16H0z" fill="url(#hv-orange)" />
      </g>
    </svg>
  );
}
