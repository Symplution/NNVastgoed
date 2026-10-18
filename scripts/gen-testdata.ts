// Maakt supabase/seed/testdata.sql en testdata_verwijderen.sql uit de demowoningen.
// Draai: npm run testdata
import { mkdirSync, writeFileSync } from 'node:fs';
import { DEMO_LISTINGS, DEMO_OFFICES } from '../src/lib/demo-data';

const PASSWORD = 'NNV-testaccount-2026';
const DOMAIN = 'nnv.test';   // gereserveerd domein: er gaat nooit echte mail naartoe

const id = (kind: number, n: number) => `a${kind.toString(16).padStart(7, '0')}-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;
const q = (v: string | null | undefined) => (v == null ? 'null' : `'${v.replace(/'/g, "''")}'`);
const n = (v: number | null | undefined) => (v == null ? 'null' : String(v));
const arr = (xs: string[]) => (xs.length ? `array[${xs.map(q).join(', ')}]::text[]` : "'{}'::text[]");

const OFFICE_ID = new Map(DEMO_OFFICES.map((o, i) => [o.id, id(1, i + 1)]));
const officeIds = [...OFFICE_ID.values()];

// ── extra woningen om statussen te kunnen testen ──
const base = DEMO_LISTINGS;
const extra = [
  { slug: 'rijksstraatweg-3-haren', office: 'o1', status: 'concept', street: 'Rijksstraatweg', nr: '3', postcode: '9752 AA', city: 'Haren', province: 'groningen', price: 525000, area: 160, rooms: 6, bed: 4, year: 1935, type: 'vrijstaand', lat: 53.1721, lng: 6.6068, headline: 'Concept: nog niet online, alleen zichtbaar in het beheer' },
  { slug: 'oosterhaven-9-delfzijl', office: 'o2', status: 'verkocht', street: 'Oosterhaven', nr: '9', postcode: '9934 AA', city: 'Delfzijl', province: 'groningen', price: 189000, area: 98, rooms: 4, bed: 2, year: 1975, type: 'tussenwoning', lat: 53.3317, lng: 6.9172, headline: 'Verkocht: nog een tijd zichtbaar met het label Verkocht' },
  { slug: 'molenweg-1-emmen', office: 'o6', status: 'ingetrokken', street: 'Molenweg', nr: '1', postcode: '7811 AA', city: 'Emmen', province: 'drenthe', price: 255000, area: 110, rooms: 5, bed: 3, year: 1982, type: 'hoekwoning', lat: 52.7801, lng: 6.8955, headline: 'Ingetrokken: niet meer zichtbaar op de site' },
];
const photos = (slug: string, commercial: boolean, label: string) =>
  (commercial ? [1, 2, 7] : [1, 2, 3, 4, 5, 6]).map((k) => ({ url: `/api/foto/${slug}-${k}`, alt: `${label}, foto ${k}` }));

const listingRows: string[] = [];
const listingId = new Map<string, string>();
let li = 0;
for (const l of base) {
  const lid = id(2, ++li); listingId.set(l.slug, lid);
  const days = Math.max(0, Math.round((new Date('2026-10-01T09:00:00Z').getTime() - new Date(l.publishedAt!).getTime()) / 86_400_000));
  listingRows.push(`(${q(lid)}, ${q(OFFICE_ID.get(l.officeId)!)}, ${q(l.slug)}, ${q(l.status)}, ${q(l.offer)}, ${q(l.category)}, ${l.newBuild}, ${q(l.street)}, ${q(l.houseNumber)}, ${q(l.houseSuffix)}, ${q(l.postcode)}, ${q(l.city)}, ${q(l.province)}, ${q(l.neighbourhood)}, ${n(l.lat)}, ${n(l.lng)}, ${l.askingPrice}, ${q(l.priceType)}, ${l.livingArea}, ${n(l.plotArea)}, ${l.rooms}, ${l.bedrooms}, ${l.bathrooms}, ${n(l.buildYear)}, ${q(l.propertyType)}, ${q(l.energyLabel)}, ${q(l.description)}, ${arr(l.features)}, ${q(JSON.stringify(l.photos))}::jsonb, ${q(JSON.stringify(l.floorplans ?? []))}::jsonb, ${q(JSON.stringify(l.photos360 ?? []))}::jsonb, ${q(l.videoUrl ?? null)}, now() - interval '${days + 1} days')`);
}
for (const e of extra) {
  const lid = id(2, ++li); listingId.set(e.slug, lid);
  const label = `${e.street} ${e.nr} ${e.city}`;
  listingRows.push(`(${q(lid)}, ${q(OFFICE_ID.get(e.office)!)}, ${q(e.slug)}, ${q(e.status)}, 'koop', 'woning', false, ${q(e.street)}, ${q(e.nr)}, null, ${q(e.postcode)}, ${q(e.city)}, ${q(e.province)}, null, ${e.lat}, ${e.lng}, ${e.price}, 'k.k.', ${e.area}, 300, ${e.rooms}, ${e.bed}, 1, ${e.year}, ${q(e.type)}, 'C', ${q(`${e.headline}.\n\nDit is een testwoning om de status te kunnen proberen.`)}, ${arr(['Tuin', 'Berging'])}, ${q(JSON.stringify(photos(e.slug, false, label)))}::jsonb, '[]'::jsonb, '[]'::jsonb, null, now() - interval '20 days')`);
}
const L = (slug: string) => q(listingId.get(slug)!);

// ── gebruikers ──
const staff = [
  { n: 1, email: `makelaar.groningen@${DOMAIN}`, name: 'Sanne Visser', role: 'agent', office: 'o1', phone: '050 123 45 67' },
  { n: 2, email: `makelaar.friesland@${DOMAIN}`, name: 'Bram de Boer', role: 'agent', office: 'o3', phone: '058 123 45 67' },
  { n: 3, email: `lezer.drenthe@${DOMAIN}`, name: 'Lotte Mulder', role: 'readonly', office: 'o5', phone: '0592 12 34 56' },
];
const seekers = [
  { n: 11, email: `anna@${DOMAIN}`, name: 'Anna de Vries', phone: '06 12345678' },
  { n: 12, email: `piet@${DOMAIN}`, name: 'Piet Jansen', phone: '06 23456789' },
  { n: 13, email: `fleur@${DOMAIN}`, name: 'Fleur Bos', phone: '06 34567890' },
];
const user = (n_: number) => q(id(3, n_));
const A = 11, P = 12, F = 13;

const userRows = [...staff, ...seekers].map((u) => `(${q(id(3, u.n))}, ${q(u.email)}, ${q(u.name)})`).join(',\n  ');

// ── leads ──
const leads: { l: string; name: string; email: string; phone: string | null; msg: string; kind: string; status: string; days: number }[] = [
  { l: 'hereweg-112-groningen', name: 'Joris Kramer', email: `joris.kramer@${DOMAIN}`, phone: '06 45678901', msg: 'Is er ruimte om de prijs te bespreken? Wij hebben interesse en kunnen snel schakelen.', kind: 'info', status: 'nieuw', days: 0 },
  { l: 'nieuwe-ebbingestraat-34-groningen', name: 'Lieke Smit', email: `lieke.smit@${DOMAIN}`, phone: null, msg: 'Mogen we de woning ook in het weekend bezichtigen?', kind: 'info', status: 'nieuw', days: 1 },
  { l: 'vinkenstraat-9-groningen', name: 'Mohammed El Amrani', email: `m.elamrani@${DOMAIN}`, phone: '06 56789012', msg: 'Wat zijn de servicekosten van de VvE en is er een erfpacht?', kind: 'info', status: 'opgepakt', days: 3 },
  { l: 'hoofdstraat-41-uithuizen', name: 'Greet Hoekstra', email: `greet.hoekstra@${DOMAIN}`, phone: '0595 12 34 99', msg: 'Wij zoeken een woonboerderij met veel grond. Is het perceel nog uit te breiden?', kind: 'info', status: 'nieuw', days: 2 },
  { l: 'nieuwestad-57-leeuwarden', name: 'Tjitske de Jong', email: `tjitske@${DOMAIN}`, phone: '06 67890123', msg: 'Is het pand een rijksmonument en zijn er subsidies voor onderhoud?', kind: 'info', status: 'afgehandeld', days: 9 },
  { l: 'kleine-kerkstraat-6-sneek', name: 'Wouter Bakker', email: `wouter.bakker@${DOMAIN}`, phone: '06 78901234', msg: 'We willen graag een tweede bezichtiging met een bouwkundige.', kind: 'bezichtiging', status: 'opgepakt', days: 4 },
  { l: 'brinkstraat-31-assen', name: 'Sanne Dijkstra', email: `sanne.d@${DOMAIN}`, phone: null, msg: 'Is de tuin op het zuiden?', kind: 'info', status: 'nieuw', days: 0 },
  { l: 'kloosterveen-fase-4-nr-6-assen', name: 'Rick Veenstra', email: `rick.veenstra@${DOMAIN}`, phone: '06 89012345', msg: 'Wanneer is de oplevering en wat zijn de termijnen?', kind: 'info', status: 'nieuw', days: 5 },
  { l: 'hoofdstraat-18-emmen', name: 'Hanneke Pol', email: `hanneke.pol@${DOMAIN}`, phone: '06 90123456', msg: 'Kunnen we er volgende week langs?', kind: 'bezichtiging', status: 'afgehandeld', days: 12 },
  { l: 'torenlaan-3-assen', name: 'Daan Wiersma', email: `daan.w@${DOMAIN}`, phone: '06 01234567', msg: 'Zijn huisdieren toegestaan en wat is de waarborgsom?', kind: 'info', status: 'nieuw', days: 1 },
  { l: 'zuiderpark-8-groningen', name: 'Marloes Visser', email: `marloes.visser@${DOMAIN}`, phone: '06 11110000', msg: 'Is een bezichtiging in het weekend mogelijk? Wij zoeken een woning met grote tuin.', kind: 'bezichtiging', status: 'nieuw', days: 0 },
  { l: 'kerkstraat-21-haren', name: 'Tim Prins', email: `tim.prins@${DOMAIN}`, phone: null, msg: 'Is de woning geschikt voor een gezin met drie kinderen?', kind: 'info', status: 'opgepakt', days: 2 },
  { l: 'oudvaart-14-sneek', name: 'Ilse van Dijk', email: `ilse.vandijk@${DOMAIN}`, phone: '06 22220000', msg: 'Wanneer is de oplevering en zijn er nog kavels beschikbaar?', kind: 'info', status: 'nieuw', days: 1 },
  { l: 'gieterstraat-9-gieten', name: 'Henk de Wit', email: `henk.dewit@${DOMAIN}`, phone: '0592 11 22 33', msg: 'Kunnen we de tuin ook zien? We hebben twee honden.', kind: 'bezichtiging', status: 'afgehandeld', days: 7 },
  { l: 'dijkweg-1-makkum', name: 'Sophie Hofstra', email: `sophie.hofstra@${DOMAIN}`, phone: null, msg: 'Mag het chalet het hele jaar worden bewoond?', kind: 'info', status: 'nieuw', days: 1 },
  { l: 'hoofdstraat-61-hoogeveen', name: 'Bakkerij De Brink', email: `info.debrink@${DOMAIN}`, phone: '0528 33 44 55', msg: 'Wat zijn de huurvoorwaarden en is horeca-gebruik toegestaan?', kind: 'info', status: 'opgepakt', days: 3 },
  { l: 'paterswoldseweg-45-groningen', name: 'Eline Postma', email: `eline.postma@${DOMAIN}`, phone: null, msg: 'Per wanneer is de woning beschikbaar?', kind: 'info', status: 'opgepakt', days: 6 },
];
const leadRows = leads.map((x) => `  (${L(x.l)}, ${q(x.name)}, ${q(x.email)}, ${q(x.phone)}, ${q(x.msg)}, ${q(x.kind)}, now() - interval '${x.days} days' - interval '${(x.name.length * 37) % 600} minutes')`).join(',\n');

// ── bezichtigingen: [woning, wanneer (werkdag-offset, 'HH:MM'), wie, status, ...] ──
type V = { l: string; day: number; time: string; min: number; name: string; email: string; phone: string | null; note: string | null; seeker?: number; status: string; by?: 'zoeker' | 'makelaar'; source?: string };
const viewings: V[] = [
  { l: 'hereweg-112-groningen', day: -6, time: '10:00', min: 30, name: 'Mark Hendriks', email: `mark.h@${DOMAIN}`, phone: '06 11223344', note: null, status: 'afgerond' },
  { l: 'nieuwe-ebbingestraat-34-groningen', day: -4, time: '11:00', min: 30, name: 'Anna de Vries', email: `anna@${DOMAIN}`, phone: '06 12345678', note: 'Met mijn partner', seeker: A, status: 'afgerond' },
  { l: 'vinkenstraat-9-groningen', day: -3, time: '14:30', min: 30, name: 'Kees Tuinstra', email: `kees.t@${DOMAIN}`, phone: null, note: null, status: 'niet_verschenen' },
  { l: 'meerweg-27-groningen', day: -2, time: '09:30', min: 30, name: 'Anna de Vries', email: `anna@${DOMAIN}`, phone: '06 12345678', note: null, seeker: A, status: 'geannuleerd', by: 'zoeker' },
  { l: 'hereweg-112-groningen', day: 1, time: '10:00', min: 30, name: 'Anna de Vries', email: `anna@${DOMAIN}`, phone: '06 12345678', note: 'Graag ook de kelder zien', seeker: A, status: 'bevestigd' },
  { l: 'nieuwe-ebbingestraat-34-groningen', day: 1, time: '11:30', min: 30, name: 'Joris Kramer', email: `joris.kramer@${DOMAIN}`, phone: '06 45678901', note: null, status: 'bevestigd' },
  { l: 'meerweg-27-groningen', day: 2, time: '09:00', min: 30, name: 'Lieke Smit', email: `lieke.smit@${DOMAIN}`, phone: null, note: 'Met een bouwkundige', status: 'bevestigd' },
  { l: 'oldehoofsterkerkhof-5-leeuwarden', day: 2, time: '11:00', min: 30, name: 'Piet Jansen', email: `piet@${DOMAIN}`, phone: '06 23456789', note: null, seeker: P, status: 'bevestigd' },
  { l: 'nieuwestad-57-leeuwarden', day: 3, time: '13:00', min: 30, name: 'Tjitske de Jong', email: `tjitske@${DOMAIN}`, phone: '06 67890123', note: 'Tweede bezichtiging', status: 'bevestigd' },
  { l: 'prof-dr-j-w-de-langestraat-19-leeuwarden', day: 4, time: '10:30', min: 30, name: 'Fleur Bos', email: `fleur@${DOMAIN}`, phone: '06 34567890', note: null, seeker: F, status: 'bevestigd' },
  { l: 'brinkstraat-31-assen', day: 2, time: '14:00', min: 30, name: 'Sanne Dijkstra', email: `sanne.d@${DOMAIN}`, phone: null, note: null, status: 'bevestigd' },
  { l: 'zuidlaarderweg-16-zuidlaren', day: 5, time: '10:00', min: 30, name: 'Fleur Bos', email: `fleur@${DOMAIN}`, phone: '06 34567890', note: 'Ruime tuin graag zien', seeker: F, status: 'bevestigd' },
  { l: 'hoofdstraat-18-emmen', day: 1, time: '15:00', min: 30, name: 'Hanneke Pol', email: `hanneke.pol@${DOMAIN}`, phone: '06 90123456', note: null, status: 'bevestigd' },
  { l: 'zuiderpark-8-groningen', day: 2, time: '10:30', min: 30, name: 'Marloes Visser', email: `marloes.visser@${DOMAIN}`, phone: '06 11110000', note: 'Met mijn partner', status: 'bevestigd' },
  { l: 'kerkstraat-21-haren', day: 3, time: '09:30', min: 30, name: 'Anna de Vries', email: `anna@${DOMAIN}`, phone: '06 12345678', note: null, seeker: A, status: 'bevestigd' },
  { l: 'gieterstraat-9-gieten', day: 4, time: '14:00', min: 30, name: 'Fleur Bos', email: `fleur@${DOMAIN}`, phone: '06 34567890', note: 'Met mijn ouders', seeker: F, status: 'bevestigd' },
  { l: 'oudvaart-14-sneek', day: 5, time: '11:00', min: 30, name: 'Piet Jansen', email: `piet@${DOMAIN}`, phone: '06 23456789', note: 'Graag de kavel zien', seeker: P, status: 'bevestigd' },
  { l: 'zuidergrachtswal-12-leeuwarden', day: -5, time: '15:00', min: 30, name: 'Piet Jansen', email: `piet@${DOMAIN}`, phone: '06 23456789', note: null, seeker: P, status: 'afgerond' },
  { l: 'plantsoen-4-meppel', day: 1, time: '16:00', min: 30, name: 'Lars Mulder', email: `lars.mulder@${DOMAIN}`, phone: '06 33330000', note: null, status: 'bevestigd' },
  { l: 'hereweg-112-groningen', day: 3, time: '15:30', min: 30, name: 'Telefonisch: familie Brouwer', email: `brouwer@${DOMAIN}`, phone: '050 987 65 43', note: 'Via de telefoon ingepland', status: 'bevestigd', source: 'makelaar' },
];
const dayExpr = (d: number) => (d < 0 ? `pg_temp.wd(${d})` : `pg_temp.wd(${d})`);
const viewingRows = viewings.map((v, i) => {
  const start = `((${dayExpr(v.day)} + time '${v.time}') at time zone 'Europe/Amsterdam')`;
  const office = OFFICE_ID.get(base.find((b) => b.slug === v.l)!.officeId)!;
  return `  (${q(id(5, i + 1))}, ${L(v.l)}, ${q(office)}, ${v.seeker ? user(v.seeker) : 'null'}, ${q(v.name)}, ${q(v.email)}, ${q(v.phone)}, ${q(v.note)}, ${start}, ${start} + interval '${v.min} minutes', ${q(v.status)}, ${q(v.by ?? null)}, ${q(v.source ?? 'site')}, now() - interval '${Math.abs(v.day) + 2} days')`;
}).join(',\n');

// ── gesprekken ──
const convs = [
  { n: 1, l: 'hereweg-112-groningen', seeker: A, office: 'o1', staffN: 1, msgs: [
    ['zoeker', 'Goedemiddag, is Hereweg 112 nog beschikbaar? En klopt het dat de tuin op het zuidwesten ligt?', 5 * 24 * 60],
    ['makelaar', 'Goedemiddag Anna, ja de woning is nog beschikbaar. De achtertuin ligt op het zuidwesten, dus tot laat in de avond zon.', 5 * 24 * 60 - 90],
    ['zoeker', 'Mooi! Is er al een bezichtiging mogelijk deze week?', 4 * 24 * 60],
    ['makelaar', 'Zeker, je kunt zelf een moment kiezen op de woningpagina onder "Bezichtiging plannen".', 4 * 24 * 60 - 40],
    ['zoeker', 'Gedaan, morgen om 10:00. Hartelijk dank!', 3 * 24 * 60],
    ['makelaar', 'Top, tot morgen! Neem gerust uw partner mee.', 60 * 2],
  ], read: 'zoeker-ongelezen' },
  { n: 2, l: 'oldehoofsterkerkhof-5-leeuwarden', seeker: P, office: 'o3', staffN: 2, msgs: [
    ['zoeker', 'Hallo, zijn er servicekosten voor het appartement en hoe hoog zijn die?', 26 * 60],
    ['makelaar', 'Dag Piet, de servicekosten zijn € 148 per maand. De VvE-stukken stuur ik graag toe.', 20 * 60],
    ['zoeker', 'Graag! En is er een parkeerplek bij het appartement?', 45],
  ], read: 'kantoor-ongelezen' },
  { n: 3, l: 'brinkstraat-31-assen', seeker: F, office: 'o5', staffN: 3, msgs: [
    ['zoeker', 'Is het mogelijk om de woning ook een tweede keer te bekijken?', 8 * 24 * 60],
    ['makelaar', 'Ja hoor, plan gerust een nieuw moment in.', 8 * 24 * 60 - 30],
    ['zoeker', 'Dank u wel, gedaan.', 8 * 24 * 60 - 120],
  ], read: 'alles-gelezen' },
  { n: 4, l: 'zuidergrachtswal-12-leeuwarden', seeker: P, office: 'o3', staffN: 2, msgs: [
    ['zoeker', 'Dag, is het appartement per direct beschikbaar en mag er een kat in?', 3 * 24 * 60],
    ['makelaar', 'Goedemorgen Piet, per 1 november beschikbaar. Een kat is toegestaan.', 3 * 24 * 60 - 60],
    ['zoeker', 'Fijn, ik kwam gisteren al kijken en wil graag een huurcontract ontvangen.', 4 * 60],
  ], read: 'kantoor-ongelezen' },
  { n: 5, l: 'zuiderpark-8-groningen', seeker: A, office: 'o1', staffN: 1, msgs: [
    ['zoeker', 'Is de tuin rondom omheind? Wij hebben een jonge hond.', 24 * 60],
    ['makelaar', 'Ja, de tuin is volledig omheind en heeft een afsluitbare poort.', 22 * 60],
  ], read: 'zoeker-ongelezen' },
] as const;
const convRows = convs.map((c) => `  (${q(id(6, c.n))}, ${L(c.l)}, ${q(OFFICE_ID.get(c.office)!)}, ${user(c.seeker)}, now() - interval '${c.msgs[0][2] + 60} minutes')`).join(',\n');
let mi = 0;
const msgRows = convs.flatMap((c) => c.msgs.map((m) => {
  const row = `  (${q(id(7, ++mi))}, ${q(id(6, c.n))}, ${q(m[0])}, ${m[0] === 'zoeker' ? user(c.seeker) : user(c.staffN)}, ${q(m[1])}, now() - interval '${m[2]} minutes')`;
  return row;
})).join(',\n');

// ── favorieten en zoekopdrachten ──
const favs: [number, string][] = [[A, 'hereweg-112-groningen'], [A, 'nieuwe-ebbingestraat-34-groningen'], [A, 'meerstad-zuid-kavel-12-groningen'], [A, 'torenlaan-3-assen'], [P, 'oldehoofsterkerkhof-5-leeuwarden'], [P, 'havenstraat-14-joure'], [P, 'zuiderhaven-1-harlingen'], [F, 'brinkstraat-31-assen'], [F, 'zuidlaarderweg-16-zuidlaren'], [A, 'zuiderpark-8-groningen'], [A, 'dijkweg-1-makkum'], [P, 'oudvaart-14-sneek'], [P, 'zuidergrachtswal-12-leeuwarden'], [F, 'gieterstraat-9-gieten'], [F, 'heidepad-6-gasselte']];
const favRows = favs.map(([u, s]) => `  (${user(u)}, ${L(s)})`).join(',\n');
const searches = [
  { n: 1, email: `anna@${DOMAIN}`, qs: 'provincie=groningen&tot=450000' },
  { n: 2, email: `piet@${DOMAIN}`, qs: 'soort=huur&tot=1300&provincie=friesland' },
  { n: 3, email: `fleur@${DOMAIN}`, qs: 'provincie=drenthe&type=vrijstaand' },
];
const searchRows = searches.map((s) => `  (${q(id(10, s.n))}, ${q(s.email)}, ${q(JSON.stringify({ qs: s.qs }))}::jsonb, now() - interval '10 days', now())`).join(',\n');

// ── beschikbaarheid: werkdagen 09:00-12:00 en 13:00-16:30, zaterdag bij twee kantoren ──
const rules: string[] = [];
let ri = 0;
for (const [oi, o] of officeIds.entries()) {
  for (let d = 1; d <= 5; d++) {
    rules.push(`  (${q(id(8, ++ri))}, ${q(o)}, ${d}, '09:00', '12:00', 30, ${oi === 2 ? 2 : 1})`);
    rules.push(`  (${q(id(8, ++ri))}, ${q(o)}, ${d}, '13:00', '16:30', 30, ${oi === 2 ? 2 : 1})`);
  }
  if (oi === 0 || oi === 2) rules.push(`  (${q(id(8, ++ri))}, ${q(o)}, 6, '10:00', '13:00', 30, 1)`);
}
const blocks = `  (${q(id(9, 1))}, ${q(officeIds[0])}, pg_temp.wd(7)::timestamp at time zone 'Europe/Amsterdam', (pg_temp.wd(8) + 1)::timestamp at time zone 'Europe/Amsterdam', 'Teamdag (test)'),
  (${q(id(9, 2))}, ${q(officeIds[2])}, (pg_temp.wd(3) + time '12:00') at time zone 'Europe/Amsterdam', (pg_temp.wd(3) + time '13:00') at time zone 'Europe/Amsterdam', 'Lunch (test)')`;

const officeRows = DEMO_OFFICES.map((o, i) => `  (${q(OFFICE_ID.get(o.id)!)}, ${q(o.slug)}, ${q(o.name)}, ${q(o.city)}, ${q(o.province)}, ${q(o.street)}, ${q(o.postcode)}, ${q(o.phone)}, ${q(o.email.replace(/@.*/, `@${DOMAIN}`))}, ${q(o.website)}, ${q(o.description)}, ${o.nvmMember}, ${q(o.logoUrl ?? null)})`).join(',\n');

const staffUpdates = staff.map((s) => `  update profiles set full_name = ${q(s.name)}, phone = ${q(s.phone)}, role = '${s.role}', office_id = ${q(OFFICE_ID.get(s.office)!)} where id = ${q(id(3, s.n))};`).join('\n');
const seekerUpdates = seekers.map((s) => `  update profiles set full_name = ${q(s.name)}, phone = ${q(s.phone)} where id = ${q(id(3, s.n))};`).join('\n');

const sql = `-- NNvastgoed — TESTGEGEVENS (gegenereerd met "npm run testdata"; niet met de hand aanpassen)
--
-- Zet een complete testomgeving in de database: kantoren, ${listingRows.length} woningen met foto's (koop, huur, nieuwbouw, bedrijfsruimte, met statussen),
-- beschikbaarheid, leads, bezichtigingen (voorbij en gepland), gesprekken met berichten, favorieten en zoekopdrachten, en testaccounts.
--
-- Testaccounts (wachtwoord voor allemaal: ${PASSWORD}):
--   Zoekers:   anna@${DOMAIN}  piet@${DOMAIN}  fleur@${DOMAIN}          → inloggen via /inloggen (geen authenticator nodig)
--   Makelaars: makelaar.groningen@${DOMAIN} (kantoor Martinihof), makelaar.friesland@${DOMAIN} (Elfsteden), lezer.drenthe@${DOMAIN} (alleen lezen, Brink & Es)
--              → inloggen via /login; de eerste keer stel je een authenticator-app in
--   Jouw eigen account (eigenaar) ziet alle kantoren.
-- Alle testadressen eindigen op @${DOMAIN}: dat domein bestaat niet, er gaat dus nooit echte mail naartoe.
--
-- Herhaalbaar: eerdere testgegevens worden eerst verwijderd. Opruimen voor je live gaat: draai testdata_verwijderen.sql.
-- Vereist: je eigen account bestaat al (de eerste gebruiker wordt eigenaar) en migraties 0001 t/m 0007 zijn gedraaid.

do $$ begin
  if (select count(*) from profiles) = 0 then
    raise exception 'Maak eerst je eigen account (uitnodiging via Authentication → Users), anders wordt een testaccount de eigenaar.';
  end if;
end $$;

-- Hulpfuncties: de n-de werkdag vanaf vandaag (negatief = terug in de tijd), in Nederlandse tijd.
create or replace function pg_temp.wd(n integer) returns date language plpgsql as $$
declare d date := (now() at time zone 'Europe/Amsterdam')::date; step integer := case when n < 0 then -1 else 1 end; left_ integer := abs(n);
begin
  while left_ > 0 loop
    d := d + step;
    if extract(isodow from d) < 6 then left_ := left_ - 1; end if;
  end loop;
  return d;
end $$;

-- 1. Eerdere testgegevens weg (ook losse recreatiewoningen uit testdata_recreatie.sql)
delete from listings where slug in (${base.filter((l) => l.category === 'recreatie').map((l) => q(l.slug)).join(', ')});
delete from saved_searches where email like '%@${DOMAIN}';
delete from offices where id in (${officeIds.map(q).join(', ')});
delete from auth.users where email like '%@${DOMAIN}';

-- 2. Testaccounts (e-mail al bevestigd; wachtwoord als hierboven)
do $$
declare r record;
begin
  for r in select * from (values
  ${userRows}
  ) as t(id, email, name) loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    values ('00000000-0000-0000-0000-000000000000', r.id::uuid, 'authenticated', 'authenticated', r.email, crypt('${PASSWORD}', gen_salt('bf')), now(), now(), now(),
            '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', r.name), now(), now(), '', '', '', '');
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), r.id::uuid, r.id, jsonb_build_object('sub', r.id, 'email', r.email, 'email_verified', true), 'email', now(), now(), now());
  end loop;
end $$;

-- 3. Kantoren
insert into offices (id, slug, name, city, province, street, postcode, phone, email, website, description, nvm_member, logo_url) values
${officeRows};

do $$ begin
${staffUpdates}
${seekerUpdates}
end $$;

-- 4. Beschikbaarheid voor bezichtigingen
insert into viewing_rules (id, office_id, weekday, start_time, end_time, slot_minutes, capacity) values
${rules.join(',\n')};
insert into viewing_blocks (id, office_id, starts_at, ends_at, reason) values
${blocks};

-- 5. Woningen met foto's
insert into listings (id, office_id, slug, status, offer, category, new_build, street, house_number, house_suffix, postcode, city, province, neighbourhood, lat, lng, asking_price, price_type, living_area, plot_area, rooms, bedrooms, bathrooms, build_year, property_type, energy_label, description, features, photos, floorplans, photos_360, video_url, published_at) values
${listingRows.join(',\n')};

-- 6. Leads (via het formulier; de status passen we daarna aan)
insert into leads (listing_id, name, email, phone, message, kind, consent, created_at) values
${leadRows.replace(/, (now\(\) - interval)/g, ', true, $1')};
${leads.map((x) => `update leads set status = ${q(x.status)} where email = ${q(x.email)};`).join('\n')}

-- 7. Bezichtigingen (voorbije tijden kan de site zelf niet inplannen; daarom gaat de controle hier even uit)
alter table viewings disable trigger viewings_before_insert_trg;
insert into viewings (id, listing_id, office_id, seeker_id, name, email, phone, note, starts_at, ends_at, status, cancelled_by, source, created_at) values
${viewingRows};
alter table viewings enable trigger viewings_before_insert_trg;

-- 8. Gesprekken en berichten
alter table conversations disable trigger conversations_before_insert_trg;
insert into conversations (id, listing_id, office_id, seeker_id, created_at) values
${convRows};
alter table conversations enable trigger conversations_before_insert_trg;
insert into messages (id, conversation_id, sender, sender_id, body, created_at) values
${msgRows};
-- Gelezen: gesprek 1 heeft een ongelezen antwoord van de makelaar, gesprek 2 een ongelezen vraag van de zoeker, gesprek 3 is gelezen.
update messages set read_at = created_at + interval '5 minutes' where conversation_id in (${q(id(6, 3))});
update messages set read_at = created_at + interval '5 minutes' where conversation_id = ${q(id(6, 1))} and created_at < now() - interval '1 day';
update messages set read_at = created_at + interval '5 minutes' where conversation_id = ${q(id(6, 2))} and sender = 'makelaar';
update conversations c set last_message_at = (select max(created_at) from messages m where m.conversation_id = c.id) where c.id in (${[1, 2, 3, 4, 5].map((k) => q(id(6, k))).join(', ')});

-- 9. Favorieten en opgeslagen zoekopdrachten
insert into favorites (user_id, listing_id) values
${favRows};
insert into saved_searches (id, email, filters, confirmed_at, last_sent_at) values
${searchRows};

-- Klaar: een overzicht van wat er nu staat.
select (select count(*) from offices where id in (${officeIds.map(q).join(', ')})) as kantoren,
       (select count(*) from listings where id::text like 'a0000002-%') as woningen,
       (select count(*) from leads where listing_id::text like 'a0000002-%') as leads,
       (select count(*) from viewings where id::text like 'a0000005-%') as bezichtigingen,
       (select count(*) from conversations where id::text like 'a0000006-%') as gesprekken,
       (select count(*) from auth.users where email like '%@${DOMAIN}') as testaccounts;
`;

const cleanup = `-- NNvastgoed — testgegevens verwijderen (hoort bij testdata.sql). Raakt alleen de testkantoren en accounts op @${DOMAIN}.
delete from saved_searches where email like '%@${DOMAIN}';
delete from offices where id in (${officeIds.map(q).join(', ')});   -- woningen, leads, bezichtigingen, gesprekken en beschikbaarheid volgen mee
delete from auth.users where email like '%@${DOMAIN}';          -- profielen en favorieten volgen mee
select (select count(*) from offices) as kantoren_over, (select count(*) from listings) as woningen_over, (select count(*) from auth.users) as accounts_over;
`;

// ── Alleen de recreatiewoningen: handig als de rest van de testgegevens al staat (of niet nodig is) ──
const rec = base.filter((l) => l.category === 'recreatie');
const recRows = rec.map((l) => {
  const days = Math.max(0, Math.round((new Date('2026-10-01T09:00:00Z').getTime() - new Date(l.publishedAt!).getTime()) / 86_400_000));
  const office = DEMO_OFFICES.find((o) => o.id === l.officeId)!;
  return `(coalesce((select id from offices where slug = ${q(office.slug)}), (select id from offices order by created_at limit 1)), ${q(l.slug)}, ${q(l.status)}, ${q(l.offer)}, 'recreatie', false, ${q(l.street)}, ${q(l.houseNumber)}, ${q(l.postcode)}, ${q(l.city)}, ${q(l.province)}, ${q(l.neighbourhood)}, ${n(l.lat)}, ${n(l.lng)}, ${l.askingPrice}, ${q(l.priceType)}, ${l.livingArea}, ${n(l.plotArea)}, ${l.rooms}, ${l.bedrooms}, ${l.bathrooms}, ${n(l.buildYear)}, ${q(l.propertyType)}, ${q(l.energyLabel)}, ${q(l.description)}, ${arr(l.features)}, ${q(JSON.stringify(l.photos))}::jsonb, now() - interval '${days + 1} days')`;
});
const recSql = `-- NNvastgoed — TESTGEGEVENS voor Recreatie (gegenereerd met "npm run testdata"; niet met de hand aanpassen)
--
-- Zet ${rec.length} recreatiewoningen (recreatiewoning, vakantiebungalow, chalet, stacaravan; koop en huur) met foto's in de database.
-- Vereist: migratie 0010_recreatie.sql is gedraaid en er bestaat minstens één kantoor (bijvoorbeeld via testdata.sql).
-- Herhaalbaar: dezelfde woningen worden eerst verwijderd. Opruimen: testdata_verwijderen.sql (haalt alle testkantoren en hun woningen weg).

do $$ begin
  if (select count(*) from offices) = 0 then
    raise exception 'Er is nog geen kantoor. Draai eerst testdata.sql, of maak een kantoor aan onder Beheer.';
  end if;
end $$;

delete from listings where slug in (${rec.map((l) => q(l.slug)).join(', ')});

insert into listings (office_id, slug, status, offer, category, new_build, street, house_number, postcode, city, province, neighbourhood, lat, lng, asking_price, price_type, living_area, plot_area, rooms, bedrooms, bathrooms, build_year, property_type, energy_label, description, features, photos, published_at) values
${recRows.join(',\n')};

select count(*) as recreatiewoningen from listings where category = 'recreatie' and status = 'beschikbaar';
`;

mkdirSync('supabase/seed', { recursive: true });
writeFileSync('supabase/seed/testdata_recreatie.sql', recSql);
writeFileSync('supabase/seed/testdata.sql', sql);
writeFileSync('supabase/seed/testdata_verwijderen.sql', cleanup);
console.log(`testdata.sql: ${sql.split('\n').length} regels, ${listingRows.length} woningen, ${viewings.length} bezichtigingen`);
