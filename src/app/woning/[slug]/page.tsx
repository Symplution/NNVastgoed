import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, CalendarCheck, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { ContactPanel } from '@/components/contact-panel';
import { ListingTabs, OpenTabButton } from '@/components/listing-tabs';
import { ViewingPlanner } from '@/components/viewing-planner';
import { Gallery } from '@/components/gallery';
import { ListingCard } from '@/components/listing-card';
import { LocationMapLazy } from '@/components/map-loader';
import { MortgageCalc } from '@/components/mortgage-calc';
import { SaveButton } from '@/components/save-button';
import { getListing, getOffice, similarListings, toMarker } from '@/lib/data';
import { siteUrl } from '@/lib/env';
import { address, formatDate, formatPrice, OFFER_LABEL, STATUS_LABEL, TYPE_LABEL } from '@/lib/format';
import { provinceName } from '@/lib/regions';

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListing((await params).slug);
  if (!l) return {};
  const title = `${address(l)}, ${l.postcode} ${l.city}`;
  const description = `${TYPE_LABEL[l.propertyType]} ${OFFER_LABEL[l.offer].toLowerCase()} in ${l.city} (${provinceName(l.province)}) voor ${formatPrice(l)}. ${l.livingArea} m²${l.rooms ? `, ${l.rooms} kamers` : ''}.`;
  return { title, description, alternates: { canonical: `/woning/${l.slug}` }, openGraph: { title, description, images: l.photos[0] ? [l.photos[0].url] : undefined } };
}

export default async function Woning({ params }: Props) {
  const l = await getListing((await params).slug);
  if (!l) notFound();
  const [office, similar] = await Promise.all([getOffice({ id: l.officeId }), similarListings(l)]);
  const title = `${address(l)}, ${l.city}`;
  const commercial = l.category === 'bedrijfsruimte';
  const marker = toMarker(l);
  const bookable = ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(l.status);
  const rows: [string, string | null][] = [
    ['Status', STATUS_LABEL[l.status]], [l.offer === 'huur' ? 'Huurprijs' : 'Vraagprijs', formatPrice(l)], [commercial ? 'Soort bedrijfsruimte' : 'Soort woning', TYPE_LABEL[l.propertyType]], ['Nieuwbouw', l.newBuild ? 'Ja' : null], ['Bouwjaar', l.buildYear ? String(l.buildYear) : null],
    [commercial ? 'Oppervlakte' : 'Woonoppervlakte', `${l.livingArea} m²`], ['Perceel', l.plotArea ? `${l.plotArea.toLocaleString('nl-NL')} m²` : null], [l.rooms ? 'Kamers' : '', l.rooms ? `${l.rooms} (waarvan ${l.bedrooms} slaapkamers)` : null],
    [l.rooms ? 'Badkamers' : '', l.rooms ? String(l.bathrooms) : null], ['Energielabel', l.energyLabel ?? null], ['Buurt', l.neighbourhood ?? null], ['Aangeboden sinds', l.publishedAt ? formatDate(l.publishedAt) : null],
  ];
  const ld = {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: title, url: `${siteUrl()}/woning/${l.slug}`, datePosted: l.publishedAt ?? undefined,
    image: l.photos.map((p) => p.url), description: l.description.slice(0, 500),
    offers: { '@type': 'Offer', price: l.askingPrice, priceCurrency: 'EUR', ...(l.offer === 'huur' ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: l.askingPrice, priceCurrency: 'EUR', unitCode: 'MON' } } : {}), availability: l.status === 'verkocht' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' },
    about: { '@type': 'SingleFamilyResidence', address: { '@type': 'PostalAddress', streetAddress: address(l), postalCode: l.postcode, addressLocality: l.city, addressRegion: provinceName(l.province), addressCountry: 'NL' }, floorSize: { '@type': 'QuantitativeValue', value: l.livingArea, unitCode: 'MTK' }, numberOfRooms: l.rooms },
  };
  return (
    <div className="container-x py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav aria-label="Kruimelpad" className="mb-4 text-sm text-muted">
        <Link href={commercial ? '/bedrijfsruimte' : l.offer === 'huur' ? '/huur' : '/koop'} className="hover:underline">{commercial ? 'Bedrijfsruimte' : l.offer === 'huur' ? 'Huur' : 'Koop'}</Link> / <Link href={`/${l.province}`} className="hover:underline">{provinceName(l.province)}</Link> / <span>{l.city}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-8">
          <Gallery photos={l.photos} title={title} />
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 flex flex-wrap gap-2">
                <span className="pill bg-brand-soft text-brand">{OFFER_LABEL[l.offer]}</span>
                {l.newBuild && <span className="pill bg-green-100 text-green-900">Nieuwbouw</span>}
                {l.status !== 'beschikbaar' && <span className="pill bg-accent-soft text-accent-dark">{STATUS_LABEL[l.status]}</span>}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight">{address(l)}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-muted"><MapPin size={16} aria-hidden /> {l.postcode} {l.city} · {provinceName(l.province)}</p>
              <p className="mt-3 text-3xl font-extrabold text-brand">{formatPrice(l)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {bookable && <OpenTabButton tab="bezichtigen" className="btn-accent"><CalendarCheck size={16} aria-hidden /> Bezichtiging plannen</OpenTabButton>}
              <SaveButton id={l.id} label />
            </div>
          </header>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[`${l.livingArea} m²`, 'woonoppervlakte'], [String(l.rooms), 'kamers'], [String(l.bedrooms), 'slaapkamers'], [l.energyLabel ?? '–', 'energielabel']].map(([v, k]) => (
              <div key={k} className="rounded-xl bg-brand-soft p-4"><dd className="text-xl font-extrabold text-brand">{v}</dd><dt className="text-xs uppercase tracking-wide text-muted">{k}</dt></div>
            ))}
          </dl>
          <ListingTabs
            initial="overzicht"
            tabs={[
              {
                id: 'overzicht', label: 'Overzicht',
                content: (
                  <div className="space-y-8">
                    <section aria-labelledby="omschrijving">
                      <h2 id="omschrijving" className="text-xl font-bold">Omschrijving</h2>
                      <div className="mt-3 space-y-3 whitespace-pre-line leading-relaxed text-ink/90">{l.description || 'Geen omschrijving beschikbaar.'}</div>
                    </section>
                    <section aria-labelledby="kenmerken">
                      <h2 id="kenmerken" className="text-xl font-bold">Kenmerken</h2>
                      <dl className="mt-3 divide-y divide-line rounded-xl border border-line">
                        {rows.filter(([, v]) => v).map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                      </dl>
                      {l.features.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{l.features.map((f) => <li key={f} className="pill bg-sand text-ink">{f}</li>)}</ul>}
                    </section>
                  </div>
                ),
              },
              {
                id: 'bezichtigen', label: 'Bezichtiging plannen',
                content: bookable
                  ? <ViewingPlanner listingId={l.id} officeName={office?.name ?? 'de makelaar'} officePhone={office?.phone} />
                  : <p className="rounded-2xl bg-sand p-6 text-muted">Voor deze woning kun je geen bezichtiging meer plannen.</p>,
              },
              ...(marker ? [{ id: 'locatie', label: 'Locatie', content: <LocationMapLazy marker={marker} addressLine={address(l)} /> }] : []),
              ...(l.offer === 'koop' && !commercial ? [{ id: 'maandlast', label: 'Maandlast', content: <MortgageCalc price={l.askingPrice} vonOrKk={l.priceType === 'v.o.n.' ? 'v.o.n.' : 'k.k.'} /> }] : []),
            ]}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5" aria-labelledby="contact">
            <h2 id="contact" className="text-lg font-bold">Interesse in deze woning?</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Je bericht gaat rechtstreeks naar de makelaar.</p>
            <ContactPanel listingId={l.id} officeName={office?.name ?? 'de makelaar'} />
          </section>
          {office && (
            <section className="card p-5" aria-labelledby="makelaar">
              <h2 id="makelaar" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted"><Building2 size={15} aria-hidden /> Aangeboden door</h2>
              <p className="mt-2 text-lg font-bold"><Link href={`/makelaars/${office.slug}`} className="hover:underline">{office.name}</Link></p>
              <p className="text-sm text-muted">{office.street && `${office.street}, `}{office.postcode} {office.city}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {office.phone && <li><a href={`tel:${office.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:underline"><Phone size={15} aria-hidden /> {office.phone}</a></li>}
                <li><a href={`mailto:${office.email}`} className="inline-flex items-center gap-2 hover:underline"><Mail size={15} aria-hidden /> {office.email}</a></li>
              </ul>
            </section>
          )}
        </aside>
      </div>
      {similar.length > 0 && (
        <section className="mt-16" aria-labelledby="vergelijkbaar">
          <h2 id="vergelijkbaar" className="text-2xl font-extrabold tracking-tight">Vergelijkbare woningen</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <ListingCard key={s.id} l={s} />)}</div>
        </section>
      )}
    </div>
  );
}
