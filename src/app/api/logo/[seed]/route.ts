import { NextResponse } from 'next/server';
import { exampleLogoSvg } from '@/lib/example-photo';

// Voorbeeldlogo's voor demo- en testgegevens (zie src/lib/example-photo.ts). Echte logo's upload je onder Mijn kantoor.
export async function GET(_: Request, { params }: { params: Promise<{ seed: string }> }) {
  return new NextResponse(exampleLogoSvg((await params).seed), { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' } });
}
