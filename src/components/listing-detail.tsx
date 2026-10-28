import type { ReactNode } from 'react';
import Link from 'next/link';
import { BedDouble, Calculator, Maximize, MapPin, Square, Zap } from 'lucide-react';
import { EnergyLabelWithInfo } from '@/components/energy-label';
import { ContactPanel } from '@/components/contact-panel';
import { ListingTabs, OpenTabButton } from '@/components/listing-tabs';
import { ListingMedia } from '@/components/listing-media';
import { OfficeCard } from '@/components/office-card';
import { ReadMore } from '@/components/read-more';
import { ViewingPlanner } from '@/components/viewing-planner';
import { ListingCard } from '@/components/listing-card';
import { LocationMapLazy } from '@/components/map-loader';
import { MortgageCalc } from '@/components/mortgage-calc';
import { TrackView } from '@/components/track-listing';
import { getOffice, similarListings, toMarker } from '@/lib/data';
import type { Listing } from '@/lib/types';
import { siteUrl } from '@/lib/env';
import { address, formatDate, formatPrice, OFFER_LABEL, STATUS_LABEL, TYPE_LABEL } from '@/lib/format';
import { provinceName } from '@/lib/regions';

/** De woningpagina zoals bezoekers hem zien. Ook gebruikt voor de voorbeeldweergave in het beheer (dan zonder tellen en zonder brochure). */
export async function ListingDetail({ l, preview = false }: { l: Listing; preview?: boolean }) {
  const [office, similar] = await Promise.all([getOffice({ id: l.officeId }), similarListings(l)]);
  const Lock = ({ children }: { children: ReactNode }) => (preview ? <div inert className="select-none">{children}</div> : <>{children}</>);
  const title = `${address(l)}, ${l.city}`;
  const commercial = l.category === 'bedrijfsruimte';
  const recreation = l.category === 'recreatie';
  const marker = toMarker(l);
  const bookable = ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(l.status);
  const rows: [string, ReactNode | null][] = [
    ['Status', STATUS_LABEL[l.status]], [l.offer === 'huur' ? 'Huurprijs' : 'Vraagprijs', formatPrice(l)], [commercial ? 'Soort bedrijfsruimte' : recreation ? 'Soort recreatiewoning' : 'Soort woning', TYPE_LABEL[l.propertyType]], ['Nieuwbouw', l.newBuild ? 'Ja' : null], ['Bouwjaar', l.buildYear ? String(l.buildYear) : null],
    [commercial ? 'Oppervlakte' : 'Woonoppervlakte', `${l.livingArea} m²`], ['Perceel', l.plotArea ? `${l.plotArea.toLocaleString('nl-NL')} m²` : null], [l.rooms ? 'Kamers' : '', l.rooms ? `${l.rooms} (waarvan ${l.bedrooms} slaapkamers)` : null],
    [l.rooms ? 'Badkamers' : '', l.rooms ? String(l.bathrooms) : null], ['Energielabel', l.energyLabel ? <EnergyLabelWithInfo key="energie" label={l.energyLabel} /> : null], ['Buurt', l.neighbourhood ?? null], ['Aangeboden sinds', l.publishedAt ? formatDate(l.publishedAt) : null],
  ];
  const published = l.publishedAt ? Date.parse(l.publishedAt) : 0;
  const isNew = published > 0 && Date.now() - published < 14 * 86_400_000 && l.status === 'beschikbaar';
  // De eerste korte alinea is de kop van de tekst; de rest is de omschrijving.
  const paras = l.description.trim().split(/\n\s*\n/);
  const headline = paras.length > 1 && paras[0].length <= 180 && !paras[0].includes('\n') ? paras[0] : null;
  const body = headline ? paras.slice(1).join('\n\n') : l.description.trim();
  const facts: { icon: ReactNode; value: ReactNode; label: string }[] = [
    { icon: <Maximize size={22} aria-hidden />, value: `${l.livingArea.toLocaleString('nl-NL')} m²`, label: commercial ? 'oppervlakte' : 'wonen' },
    ...(l.plotArea ? [{ icon: <Square size={22} aria-hidden />, value: `${l.plotArea.toLocaleString('nl-NL')} m²`, label: 'perceel' }] : []),
    ...(l.rooms ? [{ icon: <BedDouble size={22} aria-hidden />, value: String(l.bedrooms), label: l.bedrooms === 1 ? 'slaapkamer' : 'slaapkamers' }] : []),
    ...(l.energyLabel ? [{ icon: <Zap size={22} aria-hidden />, value: <EnergyLabelWithInfo key="e" label={l.energyLabel} />, label: 'energielabel' }] : []),
  ];
  const ld = {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: title, url: `${siteUrl()}/woning/${l.slug}`, datePosted: l.publishedAt ?? undefined,
    image: l.photos.map((p) => p.url), ...(l.videoUrl ? { video: { '@type': 'VideoObject', name: title, contentUrl: l.videoUrl, thumbnailUrl: l.photos[0]?.url, uploadDate: l.publishedAt ?? l.updatedAt } } : {}), description: l.description.slice(0, 500),
    offers: { '@type': 'Offer', price: l.askingPrice, priceCurrency: 'EUR', ...(l.offer === 'huur' ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: l.askingPrice, priceCurrency: 'EUR', unitCode: 'MON' } } : {}), availability: l.status === 'verkocht' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
    about: { '@type': 'SingleFamilyResidence', address: { '@type': 'PostalAddress', streetAddress: address(l), postalCode: l.postcode, addressLocality: l.city, addressRegion: provinceName(l.province), addressCountry: 'NL' }, floorSize: { '@type': 'QuantitativeValue', value: l.livingArea, unitCode: 'MTK' }, numberOfRooms: l.rooms },
  };
  return (
    <div className="container-x py-6">
      {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />}
      <nav aria-label="Kruimelpad" className="mb-4 text-sm text-muted">
        <Link href={commercial ? '/bedrijfsruimte' : recreation ? '/recreatie' : l.offer === 'huur' ? '/huur' : '/koop'} className="hover:underline">{commercial ? 'Bedrijfsruimte' : recreation ? 'Recreatie' : l.offer === 'huur' ? 'Huur' : 'Koop'}</Link> / <Link href={`/${l.province}`} className="hover:underline">{provinceName(l.province)}</Link> / <span>{l.city}</span>
      </nav>

      {!preview && <TrackView id={l.id} />}
      <ListingMedia listingId={l.id} title={title} brochureHref={preview ? undefined : `/woning/${l.slug}/pdf`} photos={l.photos} floorplans={l.floorplans ?? []} photos360={l.photos360 ?? []} videoUrl={l.videoUrl} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div className="min-w-0 space-y-8">
          <header className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="mb-3 flex flex-wrap gap-2">
                {isNew && <span className="rounded bg-[#ff9a1f] px-2.5 py-1 text-sm font-bold text-white">Nieuw</span>}
                <span className="pill bg-brand-soft text-brand">{OFFER_LABEL[l.offer]}</span>
                {l.newBuild && <span className="pill bg-green-100 text-green-900">Nieuwbouw</span>}
                {l.status !== 'beschikbaar' && <span className="pill bg-accent-soft text-accent-dark">{STATUS_LABEL[l.status]}</span>}
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{address(l)}</h1>
              <p className="mt-2 text-xl text-muted">{l.postcode} {l.city}{l.neighbourhood && <> <Link href={`/koop?q=${encodeURIComponent(l.neighbourhood)}`} className="ml-1 text-brand hover:underline">{l.neighbourhood}</Link></>}</p>
            </div>
            {marker && (
              <a href="#locatie" className="focus-ring hidden shrink-0 text-center sm:block" aria-label="Naar de kaart onderaan de pagina">
                <span className="flex h-28 w-28 items-center justify-center rounded-xl border border-line bg-[linear-gradient(135deg,#eef3f5_25%,#dfe9ee_25%,#dfe9ee_50%,#eef3f5_50%,#eef3f5_75%,#dfe9ee_75%)] bg-[length:24px_24px]"><MapPin size={34} className="fill-accent text-accent" aria-hidden /></span>
                <span className="mt-1.5 block text-lg font-semibold text-brand">Kaart</span>
              </a>
            )}
          </header>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="text-3xl font-extrabold tracking-tight">{formatPrice(l)}</p>
            {l.offer === 'koop' && !commercial && <OpenTabButton tab="maandlast" className="focus-ring inline-flex items-center gap-2 rounded text-[17px] font-semibold text-brand hover:underline"><Calculator size={22} aria-hidden /> Wat worden mijn maandlasten?</OpenTabButton>}
          </div>

          <ul className="flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-8 text-[17px]">
            {facts.map((f) => <li key={f.label} className="flex items-center gap-2.5 text-muted">{f.icon}<span className="inline-flex items-center gap-1.5"><strong className="font-bold text-ink">{f.value}</strong> {f.label}</span></li>)}
          </ul>

          {headline && <p className="rounded-lg bg-[#e4f4fd] px-6 py-5 text-lg text-brand-dark">{headline}</p>}

          <section aria-labelledby="omschrijving">
            <h2 id="omschrijving" className="text-3xl font-extrabold tracking-tight">Omschrijving</h2>
            <div className="mt-4">{body ? <ReadMore>{body}</ReadMore> : <p className="text-muted">Geen omschrijving beschikbaar.</p>}</div>
          </section>

          <ListingTabs
            initial="kenmerken"
            tabs={[
              {
                id: 'kenmerken', label: 'Kenmerken',
                content: (
                  <section aria-labelledby="kenmerken">
                    <h2 id="kenmerken" className="sr-only">Kenmerken</h2>
                    <dl className="divide-y divide-line rounded-xl border border-line">
                      {rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                    </dl>
                    {l.features.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{l.features.map((f) => <li key={f} className="pill bg-sand text-ink">{f}</li>)}</ul>}
                  </section>
                ),
              },
              {
                id: 'bezichtigen', label: 'Bezichtiging plannen',
                content: bookable
                  ? <Lock><ViewingPlanner listingId={l.id} officeName={office?.name ?? 'de makelaar'} officePhone={office?.phone} /></Lock>
                  : <p className="rounded-2xl bg-sand p-6 text-muted">Voor deze woning kun je geen bezichtiging meer plannen.</p>,
              },
              ...(l.offer === 'koop' && !commercial ? [{ id: 'maandlast', label: 'Maandlast', content: <MortgageCalc price={l.askingPrice} vonOrKk={l.priceType === 'v.o.n.' ? 'v.o.n.' : 'k.k.'} /> }] : []),
            ]}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {office ? (
            <OfficeCard office={office} bookable={bookable}><Lock><ContactPanel listingId={l.id} officeName={office.name} /></Lock></OfficeCard>
          ) : (
            <section className="card p-5" aria-labelledby="contact"><h2 id="contact" className="text-lg font-bold">Interesse in deze woning?</h2><div className="mt-3"><Lock><ContactPanel listingId={l.id} officeName="de makelaar" /></Lock></div></section>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16" aria-labelledby="vergelijkbaar">
          <h2 id="vergelijkbaar" className="text-2xl font-extrabold tracking-tight">Vergelijkbare woningen</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <ListingCard key={s.id} l={s} preview={preview} />)}</div>
        </section>
      )}

      {marker && (
        <section id="locatie" className="mt-16 scroll-mt-24" aria-labelledby="locatie-kop">
          <h2 id="locatie-kop" className="text-3xl font-extrabold tracking-tight">Locatie</h2>
          <p className="mb-4 mt-1 text-muted">{address(l)}, {l.postcode} {l.city}</p>
          <LocationMapLazy marker={marker} addressLine={address(l)} />
        </section>
      )}
    </div>
  );
}
