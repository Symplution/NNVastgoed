import { NextResponse } from 'next/server';
import { exampleSvg } from '@/lib/example-photo';

// Voorbeeldfoto's voor demo- en testgegevens (zie src/lib/example-photo.ts). Echte foto's upload je in het beheer.
export async function GET(_: Request, { params }: { params: Promise<{ seed: string }> }) {
  return new NextResponse(exampleSvg((await params).seed), { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400, immutable' } });
}
