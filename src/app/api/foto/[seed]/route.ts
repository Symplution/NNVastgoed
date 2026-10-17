import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isDemo } from '@/lib/env';

// Voorbeeldfoto's voor de demomodus: een getekend huis in een landschap, kleur en vorm afgeleid van de naam.
export async function GET(_: Request, { params }: { params: Promise<{ seed: string }> }) {
  if (!isDemo()) return new NextResponse('Niet gevonden', { status: 404 });
  const seed = (await params).seed.replace(/[^a-z0-9-]/g, '').slice(0, 80);
  const h = createHash('md5').update(seed).digest();
  const view = Number(seed.match(/-(\d)$/)?.[1] ?? 1);
  const hue = (h[0] / 255) * 360, wall = `hsl(${(hue + 20) % 360} 35% ${78 + (h[1] % 12)}%)`, roof = `hsl(${(hue + 200) % 360} 38% ${28 + (h[2] % 14)}%)`;
  const sky = ['#cfe6f3', '#e8dcc8', '#d3e4d8', '#dfe3ee'][view % 4];
  const w = 200 + (h[3] % 80), x = 400 - w / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="Voorbeeldfoto">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset="1" stop-color="#f7f4ee"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#s)"/>
<circle cx="${620 - view * 40}" cy="${90 + view * 8}" r="38" fill="#fff" opacity=".75"/>
<path d="M0 360 Q200 ${320 + view * 6} 400 350 T800 340 V500 H0Z" fill="#8fb48c"/>
<path d="M0 410 Q250 380 500 410 T800 395 V500 H0Z" fill="#6f9c72"/>
${view === 3 ? `<rect x="120" y="120" width="560" height="300" fill="${wall}"/><rect x="170" y="170" width="150" height="200" fill="#dbeaf3" stroke="#fff" stroke-width="10"/><rect x="480" y="170" width="150" height="200" fill="#dbeaf3" stroke="#fff" stroke-width="10"/><rect x="0" y="420" width="800" height="80" fill="#b9a78a"/>` : `<rect x="${x}" y="230" width="${w}" height="150" fill="${wall}"/><path d="M${x - 24} 232 L400 140 L${x + w + 24} 232Z" fill="${roof}"/><rect x="${x + 28}" y="270" width="46" height="52" fill="#dbeaf3" stroke="#fff" stroke-width="5"/><rect x="${x + w - 74}" y="270" width="46" height="52" fill="#dbeaf3" stroke="#fff" stroke-width="5"/><rect x="383" y="305" width="34" height="75" fill="${roof}"/>`}
<text x="400" y="478" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#14212b" opacity=".45">Voorbeeldfoto</text></svg>`;
  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' } });
}
