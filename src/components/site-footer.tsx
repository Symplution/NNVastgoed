import Link from 'next/link';
import { Logo } from './logo';
import { PROVINCES } from '@/lib/types';
import { provinceName } from '@/lib/regions';

export function SiteFooter() {
  const a = 'focus-ring rounded text-white/80 hover:text-white';
  return (
    <footer className="mt-20 bg-brand-dark text-white">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-white/75">Het woningaanbod van makelaars in Groningen, Friesland en Drenthe, op één plek. Van en voor het noorden.</p>
        </div>
        <nav aria-label="Zoeken" className="space-y-2 text-sm">
          <p className="font-semibold">Woningen</p>
          <ul className="space-y-2">
            <li><Link href="/koop" className={a}>Kopen</Link></li>
            <li><Link href="/huur" className={a}>Huren</Link></li>
            <li><Link href="/nieuwbouw" className={a}>Nieuwbouw</Link></li>
            <li><Link href="/bedrijfsruimte" className={a}>Bedrijfsruimte</Link></li>
            {PROVINCES.map((p) => <li key={p}><Link href={`/${p}`} className={a}>Koopwoningen {provinceName(p)}</Link></li>)}
            <li><Link href="/woningmarkt" className={a}>De woningmarkt</Link></li>
            <li><Link href="/bewaard" className={a}>Favorieten</Link></li>
          </ul>
        </nav>
        <nav aria-label="NNvastgoed" className="space-y-2 text-sm">
          <p className="font-semibold">NNvastgoed</p>
          <ul className="space-y-2">
            <li><Link href="/makelaars" className={a}>Makelaars</Link></li>
            <li><Link href="/makelaars?nvm=1" className={a}>NVM-makelaars</Link></li>
            <li><Link href="/voor-makelaars" className={a}>Aansluiten als makelaar</Link></li>
            <li><Link href="/privacy" className={a}>Privacyverklaring</Link></li>
            <li><Link href="/inloggen" className={a}>Inloggen</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/15 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} NNvastgoed · Noord Nederlands Vastgoed</div>
    </footer>
  );
}
