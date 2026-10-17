import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';

// Voorbeeldfoto's voor demo- en testgegevens: een gerenderde voorkant, tuin, woonkamer, keuken, slaapkamer, badkamer of werkruimte.
// Kleur en vorm volgen uit de naam, het laatste cijfer bepaalt welke ruimte je ziet. Echte foto's upload je in het beheer.
const VIEWS = ['Voorkant', 'Tuin', 'Woonkamer', 'Keuken', 'Slaapkamer', 'Badkamer', 'Werkruimte'] as const;

interface Pal { brick: string; brickDark: string; roof: string; roofDark: string; trim: string; door: string; wall: string; wood: string; woodDark: string; fabric: string; fabricDark: string; accent: string; sky: string; skyLow: string; green: string }

const lin = (id: string, a: string, b: string, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

const DEFS = (p: Pal) => `<defs>
${lin('sky', p.sky, p.skyLow)}${lin('lawn', '#7fae6a', '#4f8a47')}${lin('brick', p.brick, p.brickDark)}${lin('roof', p.roof, p.roofDark)}${lin('glass', '#dff0fa', '#8db7d1')}${lin('wallg', p.wall, shade(p.wall))}${lin('wood', p.wood, p.woodDark)}${lin('fabric', p.fabric, p.fabricDark)}${lin('floor', p.wood, p.woodDark)}
<linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff8e0" stop-opacity=".75"/><stop offset="1" stop-color="#fff8e0" stop-opacity="0"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
<pattern id="bricks" width="28" height="12" patternUnits="userSpaceOnUse"><rect width="28" height="12" fill="#000" opacity="0"/><path d="M0 .5H28M0 6.5H28M0 6V12M14 0V6M7 6V12M21 6V12" stroke="#fff" stroke-opacity=".22" stroke-width="1.2" fill="none"/></pattern>
<pattern id="tiles" width="22" height="14" patternUnits="userSpaceOnUse"><path d="M0 13.5H22M11 0V13.5M0 0V13.5" stroke="#000" stroke-opacity=".22" stroke-width="1.4" fill="none"/></pattern>
<pattern id="planks" width="140" height="36" patternUnits="userSpaceOnUse"><path d="M0 .5H140M0 18.5H140M60 0V18M110 18V36" stroke="#000" stroke-opacity=".16" stroke-width="1.5" fill="none"/></pattern>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="blur2"><feGaussianBlur stdDeviation="2.5"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .09 0"/></filter>
</defs>`;

function shade(hsl: string): string { return hsl.replace(/(\d+)%\)$/, (_, l) => `${Math.max(0, Number(l) - 12)}%)`); }

const win = (x: number, y: number, w: number, h: number, p: Pal) => `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" fill="${p.trim}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/><path d="M${x} ${y + h} L${x + w * 0.55} ${y} H${x + w * 0.8} L${x + w * 0.25} ${y + h}Z" fill="#fff" opacity=".28"/><path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h * 0.42} H${x + w}" stroke="${p.trim}" stroke-width="4"/><rect x="${x - 10}" y="${y + h + 6}" width="${w + 20}" height="7" fill="${p.trim}"/><rect x="${x - 10}" y="${y + h + 13}" width="${w + 20}" height="5" fill="#000" opacity=".18"/>`;
const tree = (x: number, y: number, r: number, g: string) => `<ellipse cx="${x}" cy="${y + r * 1.15}" rx="${r * 0.9}" ry="${r * 0.14}" fill="#000" opacity=".22"/><rect x="${x - r * 0.07}" y="${y}" width="${r * 0.14}" height="${r * 1.1}" fill="#5b4330"/><circle cx="${x}" cy="${y - r * 0.15}" r="${r}" fill="${g}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.6}" fill="#fff" opacity=".1"/><circle cx="${x + r * 0.4}" cy="${y + r * 0.15}" r="${r * 0.65}" fill="#000" opacity=".12"/>`;
const bush = (x: number, y: number, r: number) => `<ellipse cx="${x}" cy="${y + r * 0.7}" rx="${r * 1.2}" ry="${r * 0.2}" fill="#000" opacity=".25"/><ellipse cx="${x}" cy="${y}" rx="${r * 1.15}" ry="${r * 0.8}" fill="#3f7a3f"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.25}" rx="${r * 0.7}" ry="${r * 0.45}" fill="#6aa65a" opacity=".7"/>`;
const plant = (x: number, y: number, s: number) => `<rect x="${x - 14 * s}" y="${y - 36 * s}" width="${28 * s}" height="${36 * s}" rx="${4 * s}" fill="#e9e2d6"/><path d="M${x} ${y - 36 * s} C${x - 40 * s} ${y - 70 * s} ${x - 36 * s} ${y - 110 * s} ${x - 10 * s} ${y - 126 * s} C${x - 4 * s} ${y - 90 * s} ${x - 2 * s} ${y - 62 * s} ${x} ${y - 36 * s}Z M${x} ${y - 36 * s} C${x + 38 * s} ${y - 74 * s} ${x + 40 * s} ${y - 108 * s} ${x + 18 * s} ${y - 130 * s} C${x + 6 * s} ${y - 92 * s} ${x + 2 * s} ${y - 62 * s} ${x} ${y - 36 * s}Z" fill="#3d7a46"/>`;
const room = (p: Pal, win_ = true) => `<rect width="800" height="500" fill="url(#wallg)"/><path d="M0 0 L120 70 V350 L0 500Z" fill="#000" opacity=".08"/><path d="M0 500 L120 350 H800 V500Z" fill="url(#floor)"/><rect x="0" y="350" width="800" height="150" fill="url(#planks)" opacity=".55" transform="skewX(0)"/><rect x="120" y="344" width="680" height="8" fill="#fff" opacity=".7"/>${win_ ? `${win(470, 80, 220, 190, p)}<path d="M470 270 L690 270 L560 440 L330 440Z" fill="url(#beam)"/>` : ''}`;

const scene: Record<(typeof VIEWS)[number], (p: Pal, h: Buffer) => string> = {
  Voorkant: (p, h) => {
    const w = 330 + (h[3] % 60), x = 410 - w / 2, top = 150;
    return `<rect width="800" height="500" fill="url(#sky)"/><g opacity=".6" fill="#fff" filter="url(#blur2)"><ellipse cx="170" cy="80" rx="90" ry="16"/><ellipse cx="230" cy="64" rx="60" ry="14"/><ellipse cx="620" cy="110" rx="100" ry="14"/></g>
<path d="M0 300 Q120 255 240 295 T480 285 T800 290 V400 H0Z" fill="#6f9966" opacity=".65" filter="url(#blur2)"/>
<rect y="330" width="800" height="170" fill="url(#lawn)"/>
${tree(95, 235, 62, '#4e8f4a')}${tree(735, 250, 50, '#5a9b52')}
<path d="M360 392 L460 392 L560 500 H250Z" fill="#cfc6b8"/><path d="M395 392 L425 392 L470 500 H345Z" fill="#e2dacd" opacity=".6"/>
<ellipse cx="${410}" cy="392" rx="${w / 2 + 30}" ry="16" fill="#000" opacity=".28" filter="url(#soft)"/>
<rect x="${x}" y="${top + 40}" width="${w}" height="${392 - top - 40}" fill="url(#brick)"/><rect x="${x}" y="${top + 40}" width="${w}" height="${392 - top - 40}" fill="url(#bricks)"/>
<path d="M${x - 26} ${top + 46} L${x + w * 0.5} ${top - 62} L${x + w + 26} ${top + 46}Z" fill="url(#roof)"/><path d="M${x - 26} ${top + 46} L${x + w * 0.5} ${top - 62} L${x + w + 26} ${top + 46}Z" fill="url(#tiles)"/>
<path d="M${x - 26} ${top + 46} L${x + w + 26} ${top + 46} V${top + 58} H${x - 26}Z" fill="${p.trim}"/><rect x="${x}" y="${top + 58}" width="${w}" height="16" fill="#000" opacity=".22"/>
<rect x="${x + w - 88}" y="${top - 38}" width="34" height="68" fill="url(#brick)"/><rect x="${x + w - 94}" y="${top - 46}" width="46" height="10" fill="${p.trim}"/>
${win(x + 34, top + 64, 64, 54, p)}${win(x + w - 98, top + 64, 64, 54, p)}${win(x + 34, top + 160, 64, 62, p)}${win(x + w - 98, top + 160, 64, 62, p)}
<rect x="${x + w / 2 - 34}" y="${top + 150}" width="68" height="${392 - top - 226}" fill="${p.trim}"/><rect x="${x + w / 2 - 28}" y="${top + 156}" width="56" height="${392 - top - 232}" fill="${p.door}"/><rect x="${x + w / 2 - 18}" y="${top + 168}" width="36" height="46" fill="url(#glass)" opacity=".85"/><circle cx="${x + w / 2 + 18}" cy="${top + 232}" r="3.5" fill="#d9c27a"/><rect x="${x + w / 2 - 34}" y="${top + 142}" width="68" height="8" fill="#000" opacity=".2"/>
<rect x="${x}" y="384" width="${w}" height="10" fill="#8d8579"/>
${bush(x + 20, 392, 34)}${bush(x + w - 18, 392, 38)}${bush(x + w / 2 - 80, 394, 22)}${bush(x + w / 2 + 84, 394, 22)}
<rect x="0" y="414" width="800" height="3" fill="#2f5f33" opacity=".35"/>`;
  },
  Tuin: (p) => `<rect width="800" height="500" fill="url(#sky)"/><g opacity=".55" fill="#fff" filter="url(#blur2)"><ellipse cx="560" cy="70" rx="110" ry="15"/></g>
<rect y="230" width="800" height="270" fill="url(#lawn)"/><path d="M0 232 H800 V250 H0Z" fill="#355d34" opacity=".5"/>
${tree(120, 150, 72, '#4d8e48')}${tree(700, 175, 55, '#5a9b52')}
<rect x="470" y="150" width="270" height="130" fill="url(#brick)"/><rect x="470" y="150" width="270" height="130" fill="url(#bricks)"/><path d="M450 154 L605 80 L760 154Z" fill="url(#roof)"/><path d="M450 154 L605 80 L760 154Z" fill="url(#tiles)"/>
<rect x="500" y="180" width="150" height="100" fill="${p.trim}"/><rect x="506" y="186" width="68" height="88" fill="url(#glass)"/><rect x="580" y="186" width="64" height="88" fill="url(#glass)"/><path d="M506 274 L545 186 H565 L526 274Z" fill="#fff" opacity=".25"/>
<path d="M0 420 L800 420 L800 500 H0Z" fill="#c9bda7"/><path d="M0 420 H800" stroke="#000" stroke-opacity=".12" stroke-width="2"/><rect y="420" width="800" height="80" fill="url(#tiles)" opacity=".5"/>
<ellipse cx="320" cy="470" rx="150" ry="18" fill="#000" opacity=".22" filter="url(#soft)"/>
<rect x="210" y="372" width="220" height="14" rx="6" fill="${p.woodDark}"/><rect x="222" y="386" width="12" height="62" fill="${p.woodDark}"/><rect x="406" y="386" width="12" height="62" fill="${p.woodDark}"/>
<rect x="185" y="420" width="70" height="12" rx="5" fill="${p.wood}"/><rect x="385" y="420" width="70" height="12" rx="5" fill="${p.wood}"/><circle cx="290" cy="364" r="9" fill="#fff"/><circle cx="350" cy="364" r="9" fill="${p.accent}"/>
<path d="M0 300 H220 V360 H0Z" fill="#3e7a3d" opacity=".0"/>${bush(70, 300, 40)}${bush(430, 296, 30)}
<g>${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${40 + i * 24}" cy="${340 + (i % 2) * 8}" r="7" fill="${p.accent}"/>`).join('')}</g>`,
  Woonkamer: (p) => `${room(p)}
<ellipse cx="300" cy="448" rx="240" ry="28" fill="#000" opacity=".2" filter="url(#soft)"/>
<ellipse cx="320" cy="438" rx="200" ry="26" fill="#fff" opacity=".35"/>
<rect x="110" y="258" width="330" height="62" rx="22" fill="url(#fabric)"/><rect x="100" y="300" width="350" height="76" rx="26" fill="url(#fabric)"/><rect x="92" y="274" width="44" height="100" rx="20" fill="${p.fabricDark}"/><rect x="418" y="274" width="44" height="100" rx="20" fill="${p.fabricDark}"/>
<rect x="150" y="268" width="90" height="54" rx="14" fill="#fff" opacity=".4"/><rect x="310" y="276" width="90" height="46" rx="14" fill="${p.accent}" opacity=".75"/>
<rect x="470" y="396" width="170" height="14" rx="7" fill="url(#wood)"/><rect x="480" y="410" width="10" height="30" fill="${p.woodDark}"/><rect x="620" y="410" width="10" height="30" fill="${p.woodDark}"/>
<ellipse cx="548" cy="394" rx="26" ry="6" fill="${p.accent}"/>
<rect x="150" y="96" width="170" height="116" fill="#fff"/><rect x="160" y="106" width="150" height="96" fill="url(#sky)"/><path d="M160 202 L205 152 L238 180 L270 140 L310 202Z" fill="#5f8f5a"/>
${plant(745, 352, 1.1)}<rect x="722" y="140" width="6" height="212" fill="#33302c"/><path d="M690 150 H760 L748 112 H702Z" fill="#f4e4b4"/><ellipse cx="725" cy="150" rx="40" ry="14" fill="#ffe9a8" opacity=".4"/>`,
  Keuken: (p) => `<rect width="800" height="500" fill="url(#wallg)"/><rect y="395" width="800" height="105" fill="url(#floor)"/><rect y="395" width="800" height="105" fill="url(#planks)" opacity=".5"/>
<rect x="0" y="150" width="800" height="150" fill="#f4f1ea"/><rect x="0" y="150" width="800" height="150" fill="url(#tiles)" opacity=".5"/>
<rect x="40" y="40" width="720" height="130" fill="${p.accent}"/><path d="M40 105 H760 M220 40 V170 M400 40 V170 M580 40 V170" stroke="#000" stroke-opacity=".18" stroke-width="3"/><g fill="#e8e4dc">${[130, 310, 490, 670].map((x) => `<rect x="${x - 18}" y="146" width="36" height="5" rx="2"/>`).join('')}</g><rect x="40" y="170" width="720" height="10" fill="#000" opacity=".22"/>
<rect x="300" y="60" width="200" height="60" rx="4" fill="#c9cfd3"/><rect x="330" y="120" width="140" height="24" fill="#b5bcc1"/>
<rect x="40" y="300" width="720" height="95" fill="${p.accent}"/><path d="M220 300 V395 M400 300 V395 M580 300 V395" stroke="#000" stroke-opacity=".18" stroke-width="3"/><rect x="30" y="288" width="740" height="18" fill="#ece8df"/><rect x="30" y="306" width="740" height="6" fill="#000" opacity=".18"/>
<rect x="520" y="270" width="150" height="18" rx="4" fill="#25282b"/><circle cx="560" cy="279" r="9" fill="#444"/><circle cx="630" cy="279" r="9" fill="#444"/>
<rect x="90" y="262" width="100" height="26" rx="6" fill="#c9cfd3"/><path d="M130 262 V240 H155" stroke="#aab0b5" stroke-width="6" fill="none"/>
<rect x="220" y="450" width="360" height="26" rx="13" fill="#000" opacity=".2" filter="url(#soft)"/>
<rect x="190" y="388" width="420" height="22" rx="8" fill="#efe9dc"/><rect x="210" y="410" width="14" height="70" fill="${p.woodDark}"/><rect x="576" y="410" width="14" height="70" fill="${p.woodDark}"/><circle cx="300" cy="380" r="9" fill="#d94d3a"/><circle cx="324" cy="383" r="8" fill="#e8b330"/>
<path d="M120 20 V48" stroke="#333" stroke-width="2"/><ellipse cx="120" cy="52" rx="26" ry="10" fill="#f4e4b4"/>`,
  Slaapkamer: (p) => `${room(p, false)}${win(560, 70, 170, 200, p)}<path d="M560 270 L730 270 L640 430 L430 430Z" fill="url(#beam)"/>
<ellipse cx="320" cy="438" rx="260" ry="26" fill="#000" opacity=".22" filter="url(#soft)"/>
<rect x="150" y="150" width="380" height="140" rx="16" fill="url(#wood)"/><rect x="140" y="270" width="400" height="120" rx="16" fill="#f7f4ee"/><rect x="140" y="320" width="400" height="76" rx="14" fill="url(#fabric)"/><rect x="140" y="312" width="400" height="14" rx="6" fill="#fff" opacity=".55"/>
<rect x="170" y="284" width="140" height="48" rx="22" fill="#fff"/><rect x="360" y="284" width="140" height="48" rx="22" fill="#fff"/><rect x="190" y="300" width="100" height="26" rx="12" fill="${p.accent}" opacity=".35"/>
<rect x="60" y="310" width="62" height="86" fill="url(#wood)"/><rect x="82" y="262" width="22" height="48" rx="6" fill="#f4e4b4"/><ellipse cx="93" cy="262" rx="30" ry="9" fill="#ffe9a8" opacity=".5"/>
<rect x="556" y="318" width="62" height="78" fill="url(#wood)"/><rect x="204" y="396" width="330" height="26" rx="13" fill="${p.accent}" opacity=".45"/>${plant(700, 400, 0.9)}`,
  Werkruimte: (p) => `${room(p, false)}${win(150, 80, 500, 170, p)}<path d="M150 250 L650 250 L760 420 L40 420Z" fill="url(#beam)"/>
<ellipse cx="400" cy="440" rx="300" ry="22" fill="#000" opacity=".2" filter="url(#soft)"/>
<rect x="120" y="326" width="260" height="16" rx="3" fill="url(#wood)"/><rect x="132" y="342" width="12" height="82" fill="${p.woodDark}"/><rect x="356" y="342" width="12" height="82" fill="${p.woodDark}"/><rect x="190" y="266" width="120" height="56" rx="4" fill="#23282c"/><rect x="196" y="272" width="108" height="44" fill="#4d7ea8"/><rect x="240" y="322" width="20" height="6" fill="#23282c"/>
<rect x="430" y="326" width="260" height="16" rx="3" fill="url(#wood)"/><rect x="442" y="342" width="12" height="82" fill="${p.woodDark}"/><rect x="666" y="342" width="12" height="82" fill="${p.woodDark}"/><rect x="520" y="266" width="120" height="56" rx="4" fill="#23282c"/><rect x="526" y="272" width="108" height="44" fill="#7a9a6a"/>
<rect x="384" y="368" width="56" height="62" rx="14" fill="url(#fabric)"/><rect x="392" y="340" width="40" height="34" rx="10" fill="${p.fabricDark}"/>${plant(80, 420, 0.9)}`,
  Badkamer: (p) => `<rect width="800" height="500" fill="#eef3f5"/><rect width="800" height="400" fill="url(#tiles)" opacity=".7"/><rect y="400" width="800" height="100" fill="#cfd6d9"/><rect y="400" width="800" height="100" fill="url(#tiles)" opacity=".6"/>
<rect width="800" height="400" fill="url(#beam)" opacity=".18"/>
<ellipse cx="260" cy="440" rx="240" ry="22" fill="#000" opacity=".2" filter="url(#soft)"/>
<rect x="70" y="276" width="400" height="128" rx="46" fill="#fff"/><rect x="92" y="290" width="356" height="52" rx="26" fill="#c8e3f1"/><path d="M92 316 Q270 296 448 316" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/><rect x="70" y="276" width="400" height="12" rx="6" fill="#000" opacity=".06"/>
<rect x="450" y="240" width="14" height="60" fill="#aab4ba"/><path d="M457 240 Q457 214 430 214" stroke="#aab4ba" stroke-width="8" fill="none"/>
<rect x="540" y="224" width="220" height="28" rx="10" fill="#fff"/><rect x="570" y="252" width="160" height="150" fill="#f4f6f7"/><path d="M570 328 H730" stroke="#000" stroke-opacity=".12"/><rect x="630" y="236" width="12" height="-4" fill="#aab4ba"/><rect x="640" y="198" width="8" height="26" fill="#aab4ba"/><path d="M644 198 Q644 184 626 184" stroke="#aab4ba" stroke-width="6" fill="none"/>
<rect x="550" y="50" width="200" height="140" rx="12" fill="url(#glass)" stroke="#c4ccd0" stroke-width="8"/><path d="M560 190 L650 50 H690 L600 190Z" fill="#fff" opacity=".3"/>
<rect x="680" y="372" width="70" height="26" rx="6" fill="#e8e4dc"/><rect x="90" y="150" width="64" height="94" fill="${p.accent}" opacity=".85"/>${plant(520, 404, 0.6)}`,
};

export async function GET(_: Request, { params }: { params: Promise<{ seed: string }> }) {
  const seed = (await params).seed.replace(/[^a-z0-9-]/g, '').slice(0, 90);
  const h = createHash('md5').update(seed.replace(/-\d$/, '')).digest();
  const n = Math.min(7, Math.max(1, Number(seed.match(/-(\d)$/)?.[1] ?? 1)));
  const tone = h[0] % 5, hue = (h[1] / 255) * 360;
  const bricks = [['#b8553a', '#8f3b26'], ['#a8482f', '#7d301d'], ['#c58a5c', '#9a6641'], ['#d9c3a0', '#b49b78'], ['#8c5a44', '#654030']][tone];
  const p: Pal = {
    brick: bricks[0], brickDark: bricks[1], roof: '#5a4a4c', roofDark: '#2f2628', trim: '#f4f1ea',
    door: ['#2f5a6d', '#6d2f2f', '#2f4a36', '#2a2d33'][h[2] % 4],
    wall: `hsl(${40 + (h[3] % 20)} ${20 + (h[4] % 14)}% ${90 - (h[5] % 6)}%)`,
    wood: `hsl(${28 + (h[6] % 10)} ${38 + (h[7] % 10)}% ${60 + (h[8] % 8)}%)`, woodDark: `hsl(${28 + (h[6] % 10)} ${38 + (h[7] % 10)}% ${44 + (h[8] % 8)}%)`,
    fabric: `hsl(${hue} 18% ${58 + (h[9] % 10)}%)`, fabricDark: `hsl(${hue} 18% ${44 + (h[9] % 10)}%)`,
    accent: `hsl(${150 + (h[1] % 90)} 22% ${48 + (h[10] % 14)}%)`,
    sky: ['#8cc3ea', '#9ec9e8', '#a6c4dc', '#b4d3ea'][h[11] % 4], skyLow: '#eaf3f8', green: '#4f8a47',
  };
  const view = VIEWS[n - 1];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Voorbeeldfoto: ${view}">${DEFS(p)}${scene[view](p, h)}<rect width="800" height="500" fill="url(#vig)"/><rect width="800" height="500" filter="url(#grain)"/><rect x="598" y="466" width="190" height="24" rx="12" fill="#101820" opacity=".45"/><text x="693" y="483" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#fff">Voorbeeldfoto · ${view}</text></svg>`;
  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' } });
}
