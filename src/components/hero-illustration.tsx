// Getekend noordelijk landschap voor de homepage: Martinitoren, trapgevelhuizen, molen, stelpboerderij en een hunebed.
// Alleen vormen, geen tekst; decoratief (aria-hidden).
const WIN = '#8fd3f4';
const DARK = '#7a2a14';

function Row({ x, w, h, body, roof, gable }: { x: number; w: number; h: number; body: string; roof: string; gable: 'punt' | 'trap' | 'plat' }) {
  const y = 214 - h;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={body} />
      {gable === 'punt' && <polygon points={`${x - 3},${y} ${x + w / 2},${y - 26} ${x + w + 3},${y}`} fill={roof} />}
      {gable === 'trap' && (
        <g fill={body}>
          <rect x={x + 3} y={y - 8} width={w - 6} height={8} /><rect x={x + 7} y={y - 15} width={w - 14} height={7} /><rect x={x + 11} y={y - 21} width={w - 22} height={6} />
        </g>
      )}
      {gable === 'plat' && <rect x={x - 2} y={y - 5} width={w + 4} height={5} fill={roof} />}
      <rect x={x + 6} y={y + 10} width={9} height={14} rx={4.5} fill={WIN} />
      <rect x={x + w - 15} y={y + 10} width={9} height={14} rx={4.5} fill={WIN} />
      <rect x={x + 6} y={y + 34} width={9} height={14} rx={1} fill={WIN} opacity={0.9} />
      <rect x={x + w - 15} y={y + 34} width={9} height={14} rx={1} fill={WIN} opacity={0.9} />
      <rect x={x + w / 2 - 5} y={206 - 18} width={10} height={20} rx={5} fill={DARK} />
    </g>
  );
}

export function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 640 260" className={className} preserveAspectRatio="xMaxYMax meet">
      <defs>
        <linearGradient id="nnv-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.05" stopColor="#fff" /><stop offset="0.96" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <mask id="nnv-mask"><rect width="640" height="260" fill="url(#nnv-fade)" /></mask>
      </defs>
      <g mask="url(#nnv-mask)">
      {/* wolken en zon */}
      <circle cx="560" cy="48" r="26" fill="#fcd34d" opacity="0.9" />
      <g fill="#fff" opacity="0.22"><rect x="150" y="30" width="96" height="16" rx="8" /><rect x="176" y="18" width="52" height="16" rx="8" /><rect x="380" y="58" width="80" height="14" rx="7" /><rect x="402" y="47" width="44" height="14" rx="7" /></g>

      {/* Martinitoren */}
      <g>
        <polygon points="64,2 56,44 72,44" fill="#e8742c" />
        <rect x="55" y="44" width="18" height="26" fill="#f6efe4" /><rect x="60" y="50" width="8" height="12" rx="4" fill={DARK} />
        <rect x="48" y="70" width="32" height="140" fill="#f0e2cf" />
        <rect x="48" y="70" width="32" height="6" fill="#d9c3a6" />
        <rect x="58" y="84" width="12" height="22" rx="6" fill={DARK} /><rect x="58" y="116" width="12" height="22" rx="6" fill={DARK} opacity="0.85" /><rect x="58" y="148" width="12" height="22" rx="6" fill={DARK} opacity="0.7" />
      </g>

      {/* huizenrij */}
      <Row x={96} w={40} h={86} body="#f59e0b" roof={DARK} gable="trap" />
      <Row x={138} w={38} h={72} body="#b4472b" roof="#7a2a14" gable="punt" />
      <Row x={178} w={42} h={96} body="#f6efe4" roof="#e8742c" gable="trap" />
      <Row x={222} w={36} h={66} body="#fcd34d" roof={DARK} gable="plat" />

      {/* molen */}
      <g>
        <polygon points="316,214 332,214 328,128 320,128" fill="#f0e2cf" />
        <polygon points="312,128 336,128 324,106" fill={DARK} />
        <g stroke="#7a2a14" strokeWidth="3" strokeLinecap="round"><line x1="324" y1="124" x2="296" y2="96" /><line x1="324" y1="124" x2="352" y2="152" /><line x1="324" y1="124" x2="352" y2="96" /><line x1="324" y1="124" x2="296" y2="152" /></g>
        <g fill="#fff" opacity="0.85"><polygon points="296,96 308,90 312,104 300,108" /><polygon points="352,152 340,158 336,144 348,140" /><polygon points="352,96 346,84 334,90 340,102" /><polygon points="296,152 302,164 314,158 308,146" /></g>
        <circle cx="324" cy="124" r="4" fill={DARK} />
      </g>

      {/* stelpboerderij */}
      <g>
        <rect x="366" y="150" width="104" height="64" fill="#e8742c" />
        <polygon points="358,152 418,92 478,152" fill={DARK} />
        <polygon points="418,92 478,152 418,152" fill="#5e1f0e" />
        <rect x="402" y="172" width="32" height="42" rx="3" fill="#fcd34d" /><line x1="418" y1="172" x2="418" y2="214" stroke={DARK} strokeWidth="2" /><line x1="402" y1="172" x2="434" y2="214" stroke={DARK} strokeWidth="2" /><line x1="434" y1="172" x2="402" y2="214" stroke={DARK} strokeWidth="2" />
        <circle cx="418" cy="130" r="7" fill={WIN} /><rect x="376" y="162" width="14" height="14" rx="2" fill={WIN} /><rect x="446" y="162" width="14" height="14" rx="2" fill={WIN} />
      </g>

      {/* hunebed */}
      <g fill="#9aa5b1">
        <rect x="500" y="196" width="18" height="20" rx="5" /><rect x="530" y="196" width="18" height="20" rx="5" /><rect x="494" y="184" width="62" height="16" rx="7" fill="#b7c0ca" />
      </g>

      {/* bomen */}
      <g>
        <rect x="582" y="170" width="6" height="44" fill={DARK} /><circle cx="585" cy="158" r="26" fill="#2fa58a" /><circle cx="570" cy="172" r="15" fill="#34b394" />
        <rect x="620" y="186" width="5" height="30" fill={DARK} /><ellipse cx="622" cy="176" rx="14" ry="22" fill="#2fa58a" />
      </g>

      {/* heuvels op de voorgrond */}
      <path d="M0 238c60-22 120-26 190-12s150 20 230 4 150-24 220-8v38H0z" fill="#fcd34d" />
      <path d="M0 250c90-16 170-18 260-6s200 8 380-6v22H0z" fill="#34b394" />
      <path d="M0 258c120-8 260-10 400-4s170 2 240-2v8H0z" fill="#e8742c" />
      </g>
    </svg>
  );
}
