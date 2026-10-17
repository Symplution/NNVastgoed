import type { Metadata } from 'next';
import Link from 'next/link';
import { allLiveListings } from '@/lib/data';
import { formatEuro } from '@/lib/format';
import { marketStats } from '@/lib/market';
import { provinceName } from '@/lib/regions';

export const metadata: Metadata = { title: 'De woningmarkt in het noorden', description: 'Prijzen, kosten en tips voor kopen, huren, nieuwbouw en bedrijfsruimte in Groningen, Friesland en Drenthe.' };
export const revalidate = 3600;

const ARTICLES = [
  { id: 'kopen', t: 'Een huis kopen: de stappen', items: [
    'Bepaal je budget. Laat een hypotheekadviseur uitrekenen wat je kunt lenen en wat je maandlast wordt.',
    'Zoek en laat je mailen. Sla je zoekopdracht op, dan hoor je het als eerste als er iets passends komt.',
    'Plan een bezichtiging, kijk goed naar onderhoud, isolatie en energielabel, en stel vragen aan de makelaar.',
    'Breng een bod uit. Na de koopakte heb je als koper drie dagen bedenktijd.',
    'Regel de financiering en de overdracht bij de notaris.'] },
  { id: 'kosten', t: 'Kosten koper', items: [
    'Bij een koopwoning komt er bovenop de koopsom een aantal kosten: onder meer overdrachtsbelasting, notaris, taxatie en hypotheekadvies.',
    'Als vuistregel tellen kopers een paar procent van de koopsom extra. Vraag je adviseur om een berekening voor jouw situatie.',
    'Bij vrij-op-naam (v.o.n.) betaal je de overdrachtskosten niet apart bovenop de koopsom; bij kosten koper (k.k.) wel.'] },
  { id: 'huren', t: 'Een woning huren', items: [
    'De huurprijs staat per maand bij de woning. Kijk of servicekosten, energie en gemeentelijke heffingen erbij zitten.',
    'Vraag voor je tekent naar de waarborgsom, de looptijd en de opzegtermijn.',
    'Voor huurwoningen gelden wettelijke regels. Kijk op huurcommissie.nl voor wat actueel is.'] },
  { id: 'nieuwbouw', t: 'Nieuwbouw', items: [
    'Je koopt vaak vóór de bouw, op basis van tekeningen en een afbouwlijst. Lees de stukken goed door.',
    'De betaling loopt meestal in termijnen tijdens de bouw. Let op de afspraken over de oplevering en de garantie.',
    'Laat bij de oplevering de woning goed inspecteren en leg gebreken schriftelijk vast.'] },
  { id: 'bedrijfsruimte', t: 'Bedrijfsruimte', items: [
    'Kies op locatie, bereikbaarheid, parkeren en uitbreidingsmogelijkheden, niet alleen op de prijs per vierkante meter.',
    'Voor huur van winkel- en horecaruimte gelden vaak wettelijke termijnen en bescherming; bij kantoorruimte is er meer vrijheid.',
    'Laat een huur- of koopcontract voor bedrijfsruimte door een specialist controleren.'] },
];

export default async function Woningmarkt() {
  const stats = marketStats(await allLiveListings());
  const tile = 'card p-5';
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">De woningmarkt in het noorden</h1>
      <p className="mt-2 max-w-2xl text-muted">Wat er nu te koop en te huur staat in Groningen, Friesland en Drenthe, en alles wat je moet weten voordat je een stap zet.</p>

      <section aria-labelledby="cijfers" className="mt-8">
        <h2 id="cijfers" className="text-xl font-bold">Het aanbod nu</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/koop" className={tile}><p className="text-3xl font-extrabold text-brand">{stats.koop}</p><p className="text-sm text-muted">koopwoningen</p></Link>
          <Link href="/huur" className={tile}><p className="text-3xl font-extrabold text-brand">{stats.huur}</p><p className="text-sm text-muted">huurwoningen{stats.avgRent ? ` · gem. ${formatEuro(stats.avgRent)} p.m.` : ''}</p></Link>
          <Link href="/nieuwbouw" className={tile}><p className="text-3xl font-extrabold text-brand">{stats.nieuwbouw}</p><p className="text-sm text-muted">nieuwbouw</p></Link>
          <Link href="/bedrijfsruimte" className={tile}><p className="text-3xl font-extrabold text-brand">{stats.bedrijfsruimte}</p><p className="text-sm text-muted">bedrijfsruimtes</p></Link>
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <caption className="sr-only">Koopwoningen per provincie</caption>
            <thead className="bg-sand text-xs uppercase tracking-wide text-muted"><tr><th scope="col" className="px-4 py-3">Provincie</th><th scope="col" className="px-4 py-3">Koopwoningen</th><th scope="col" className="px-4 py-3">Gemiddelde vraagprijs</th><th scope="col" className="px-4 py-3">Per m²</th></tr></thead>
            <tbody className="divide-y divide-line">
              {stats.provinces.map((p) => (
                <tr key={p.province}>
                  <th scope="row" className="px-4 py-3 font-semibold"><Link href={`/${p.province}`} className="text-brand hover:underline">{provinceName(p.province)}</Link></th>
                  <td className="px-4 py-3">{p.count}</td><td className="px-4 py-3">{p.avgPrice ? formatEuro(p.avgPrice) : '–'}</td><td className="px-4 py-3">{p.avgPerM2 ? formatEuro(p.avgPerM2) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Cijfers uit het aanbod op NNvastgoed, van woningen die nu online staan. Dit is geen officiële prijsstatistiek en zegt niets over verkoopprijzen.</p>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {ARTICLES.map((a) => (
          <section key={a.id} id={a.id} aria-labelledby={`h-${a.id}`} className="card p-6">
            <h2 id={`h-${a.id}`} className="text-lg font-bold">{a.t}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink/90">{a.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">Algemene informatie, geen persoonlijk of juridisch advies. Regels en bedragen veranderen; vraag bij twijfel een makelaar, hypotheekadviseur of jurist.</p>
    </div>
  );
}
