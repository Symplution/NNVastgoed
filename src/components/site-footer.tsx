import Link from 'next/link';
import { Logo } from './logo';
import { PROVINCES } from '@/lib/types';
import { provinceName } from '@/lib/regions';
import { placeHref } from '@/lib/places';

const COLUMNS: { title: string; links: [string, string][] }[] = [
  { title: 'Snel naar', links: [['Koopwoningen', '/koop'], ['Huurwoningen', '/huur'], ['Nieuwbouw', '/nieuwbouw'], ['Bedrijfsruimte', '/bedrijfsruimte'], ['Zoek een NVM-makelaar', '/makelaars?nvm=1'], ['Mijn favorieten', '/bewaard']] },
  { title: 'Inzichten & inspiratie', links: [['De woningmarkt', '/woningmarkt'], ['Alle artikelen', '/artikelen'], ['Alles over een huis kopen', '/artikelen/huis-kopen-in-het-noorden'], ['Alles over een huis verkopen', '/artikelen/huis-verkopen-voorbereiding'], ['Checklist bezichtiging', '/artikelen/bezichtiging-checklist'], ['Veelgestelde vragen', '/veelgestelde-vragen']] },
  { title: 'Voor makelaars', links: [['Meld je kantoor aan', '/voor-makelaars/aanmelden'], ['Aansluiten en koppelen', '/voor-makelaars'], ['Inloggen voor makelaars', '/login'], ['Aangesloten kantoren', '/makelaars']] },
  { title: 'Meer NNvastgoed', links: [['Over NNvastgoed', '/over-ons'], ['Contact', '/contact'], ['Inloggen of account maken', '/inloggen'], ['Toegankelijkheid', '/toegankelijkheid']] },
];
const CITIES = ['Groningen', 'Assen', 'Leeuwarden', 'Emmen', 'Sneek', 'Heerenveen', 'Hoogeveen', 'Drachten'];

export function SiteFooter() {
  const a = 'focus-ring rounded text-white/80 hover:text-white hover:underline';
  return (
    <footer className="mt-20 bg-brand-dark text-white">
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/75">Het woningaanbod van makelaars in Groningen, Friesland en Drenthe, op één plek. Van en voor het noorden.</p>
          <ul className="mt-5 flex flex-wrap gap-2 text-xs">{PROVINCES.map((p) => <li key={p}><Link href={`/${p}`} className="focus-ring rounded-full border border-white/25 px-3 py-1 text-white/85 hover:bg-white/10">{provinceName(p)}</Link></li>)}</ul>
        </div>
        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title} className="text-sm">
            <p className="font-semibold">{c.title}</p>
            <ul className="mt-3 space-y-2">{c.links.map(([label, href]) => <li key={href}><Link href={href} className={a}>{label}</Link></li>)}</ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/15">
        <div className="container-x py-5 text-sm">
          <p className="font-semibold">Populaire steden</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">{CITIES.map((c) => <li key={c}><Link href={placeHref(c)} className={a}>Koopwoningen {c}</Link></li>)}</ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/65 sm:flex-row">
          <p>© {new Date().getFullYear()} NNvastgoed · Noord Nederlands Vastgoed</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li><Link href="/privacy" className={a}>Privacy</Link></li><li><Link href="/voorwaarden" className={a}>Voorwaarden</Link></li><li><Link href="/cookies" className={a}>Cookies</Link></li><li><Link href="/toegankelijkheid" className={a}>Toegankelijkheid</Link></li><li><Link href="/contact" className={a}>Contact</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
