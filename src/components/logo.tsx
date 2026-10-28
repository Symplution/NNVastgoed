import Link from 'next/link';

/** Woordmerk: het logo (een woning in een vergrootglas, met transparante achtergrond) met de naam ernaast. Op een donkere achtergrond (`light`) staat het logo op een wit vlak. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-md" aria-label="NNVastgoed, naar de voorpagina">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {light ? <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white"><img src="/brand/logo.png" alt="" width={35} height={37} className="h-8 w-auto" /></span> : <img src="/brand/logo.png" alt="" width={39} height={42} className="h-10 w-auto" />}
      <span className={`block text-xl font-extrabold leading-none tracking-tight ${light ? 'text-white' : 'text-brand'}`}>NNVastgoed</span>
    </Link>
  );
}
