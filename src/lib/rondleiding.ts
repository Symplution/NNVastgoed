// De rondleiding over de site: één voor een woningzoeker en één voor een makelaar. Elke stap markeert een onderdeel van de site
// (target = CSS-selector) en is af zodra de bezoeker op die pagina is geweest (match) of de stap zelf afvinkt.
export type TourId = 'klant' | 'makelaar';
export interface TourStep { id: string; title: string; text: string; href: string; target: string; match: (path: string) => boolean; /** Alleen te bereiken als je bent ingelogd (het beheer). */ needsLogin?: boolean }

/** De inlogpagina's voor makelaars: daar begeleiden we naar het formulier. */
export const isLoginPage = (path: string) => path === '/login' || path === '/mfa' || path === '/wachtwoord'
export const LOGIN_TARGET = 'main form'
export interface Tour { id: TourId; label: string; intro: string; steps: TourStep[] }

const under = (base: string) => (p: string) => p === base || p.startsWith(`${base}/`);
const exact = (base: string) => (p: string) => p === base;
const nav = (aria: string, href: string) => `nav[aria-label="${aria}"] a[href="${href}"]`;

export const TOURS: Record<TourId, Tour> = {
  klant: {
    id: 'klant',
    label: 'Ik zoek een woning',
    intro: 'We lopen samen langs alles wat je als woningzoeker nodig hebt, van zoeken tot een bezichtiging plannen.',
    steps: [
      { id: 'kopen', title: 'Kopen', text: 'Hier staan alle koopwoningen in Groningen, Friesland en Drenthe. Filter op prijs, plaats en soort woning.', href: '/koop', target: nav('Soort aanbod', '/koop'), match: under('/koop') },
      { id: 'huren', title: 'Huren', text: 'Huurwoningen, met de huurprijs per maand.', href: '/huur', target: nav('Soort aanbod', '/huur'), match: under('/huur') },
      { id: 'nieuwbouw', title: 'Nieuwbouw', text: 'Nieuwbouwprojecten en woningen die nog gebouwd worden.', href: '/nieuwbouw', target: nav('Soort aanbod', '/nieuwbouw'), match: under('/nieuwbouw') },
      { id: 'recreatie', title: 'Recreatie', text: 'Chalets, bungalows en vakantiehuizen, ook als tweede huis.', href: '/recreatie', target: nav('Soort aanbod', '/recreatie'), match: under('/recreatie') },
      { id: 'bedrijfsruimte', title: 'Bedrijfsruimte', text: 'Kantoren, hallen, winkels en horeca.', href: '/bedrijfsruimte', target: nav('Soort aanbod', '/bedrijfsruimte'), match: under('/bedrijfsruimte') },
      { id: 'woning', title: 'Bekijk een woning', text: 'Open een woning: foto’s, video, plattegrond, kaart en een brochure om te downloaden. Je kunt hier ook een bezichtiging plannen of een bericht sturen.', href: '/koop', target: 'article a[href^="/woning/"]', match: under('/woning') },
      { id: 'favorieten', title: 'Bewaar je favorieten', text: 'Met het hartje bewaar je een woning. Hier vind je ze terug, ook zonder account.', href: '/bewaard', target: 'header a[aria-label="Favorieten"]', match: (p) => p === '/bewaard' || under('/mijn/favorieten')(p) },
      { id: 'account', title: 'Maak een account of log in', text: 'Met een gratis account bewaar je favorieten voor altijd, plan je bezichtigingen en ontvang je berichten van de makelaar.', href: '/inloggen', target: '[data-tour="account"]', match: (p) => p === '/inloggen' || under('/mijn')(p) },
      { id: 'bezichtigingen', title: 'Je bezichtigingen', text: 'Hier zie je welke bezichtigingen je hebt gepland, en je kunt ze zelf annuleren.', href: '/mijn/bezichtigingen', target: nav('Mijn NNV', '/mijn/bezichtigingen'), match: under('/mijn/bezichtigingen') },
      { id: 'berichten', title: 'Berichten van de makelaar', text: 'Antwoorden van makelaars lees je hier, in één overzicht.', href: '/mijn/berichten', target: nav('Mijn NNV', '/mijn/berichten'), match: under('/mijn/berichten') },
    ],
  },
  makelaar: {
    id: 'makelaar',
    label: 'Ik ben makelaar',
    intro: 'We lopen samen langs alles wat je als makelaar doet: kennismaken, prijzen, registreren en je dagelijkse werk in het beheer.',
    steps: [
      { id: 'voor-makelaars', title: 'Voor makelaars', text: 'Wat NNvastgoed voor je kantoor doet: je aanbod tonen, koppelen met je kantoorsoftware en leads ontvangen.', href: '/voor-makelaars', target: 'header a[href="/voor-makelaars"], footer a[href="/voor-makelaars"]', match: exact('/voor-makelaars') },
      { id: 'prijzen', title: 'Bekijk de prijzen', text: 'Registreren is gratis, een woning plaatsen kost € 200 en Topper van de maand is € 75 extra (excl. btw). Geen abonnement.', href: '/voor-makelaars', target: 'a[href="/voor-makelaars/prijzen"]', match: exact('/voor-makelaars/prijzen') },
      { id: 'aanmelden', title: 'Registreer je kantoor', text: 'Meld je kantoor gratis aan. Wij nemen binnen twee werkdagen contact met je op.', href: '/voor-makelaars/aanmelden', target: 'main a[href="/voor-makelaars/aanmelden"], footer a[href="/voor-makelaars/aanmelden"]', match: under('/voor-makelaars/aanmelden') },
      { id: 'inloggen', title: 'Log in als makelaar', text: 'Heb je een account? Log in met je wachtwoord en de tweede inlogstap.', href: '/login', target: 'main a[href="/login"], footer a[href="/login"]', match: (p) => p === '/login' || p === '/mfa' || under('/beheer')(p) },
      { id: 'overzicht', title: 'Overzicht', text: 'Je startpagina met het stappenplan en wat er vandaag speelt.', href: '/beheer', target: nav('Beheer', '/beheer'), match: exact('/beheer'), needsLogin: true },
      { id: 'woningen', title: 'Woningen', text: 'Je woningen met statistieken per woning (getoond, bekeken, bewaard), een voorbeeldweergave en Topper van de maand.', href: '/beheer/woningen', target: nav('Beheer', '/beheer/woningen'), match: under('/beheer/woningen'), needsLogin: true },
      { id: 'bezichtigingen', title: 'Bezichtigingen', text: 'De agenda met geplande bezichtigingen, en hier stel je in wanneer zoekers zelf mogen plannen.', href: '/beheer/bezichtigingen', target: nav('Beheer', '/beheer/bezichtigingen'), match: under('/beheer/bezichtigingen'), needsLogin: true },
      { id: 'berichten', title: 'Berichten', text: 'Gesprekken met woningzoekers. Je ziet direct wat nog ongelezen is.', href: '/beheer/berichten', target: nav('Beheer', '/beheer/berichten'), match: under('/beheer/berichten'), needsLogin: true },
      { id: 'leads', title: 'Leads', text: 'Elk contactverzoek, met de woning erbij. Zet de status op opgepakt of afgehandeld.', href: '/beheer/leads', target: nav('Beheer', '/beheer/leads'), match: under('/beheer/leads'), needsLogin: true },
      { id: 'contacten', title: 'Contacten', text: 'Alle zoekers die jou schreven of een bezichtiging planden.', href: '/beheer/contacten', target: nav('Beheer', '/beheer/contacten'), match: under('/beheer/contacten'), needsLogin: true },
      { id: 'koppelingen', title: 'Koppelingen', text: 'Koppel je kantoorsoftware, zoals Realworks, zodat je aanbod vanzelf bijgewerkt wordt.', href: '/beheer/koppelingen', target: nav('Beheer', '/beheer/koppelingen'), match: under('/beheer/koppelingen'), needsLogin: true },
      { id: 'kantoor', title: 'Mijn kantoor', text: 'Je kantoorprofiel met logo, adres en telefoonnummer. Je logo komt bij elke woning en op de brochure.', href: '/beheer/kantoor', target: nav('Beheer', '/beheer/kantoor'), match: under('/beheer/kantoor'), needsLogin: true },
    ],
  },
};

export const TOUR_IDS = Object.keys(TOURS) as TourId[];
export interface TourState { open: boolean; tab: TourId; started: Record<TourId, boolean>; done: Record<TourId, string[]>; celebrated: Record<TourId, boolean> }
export const EMPTY_STATE: TourState = { open: false, tab: 'klant', started: { klant: false, makelaar: false }, done: { klant: [], makelaar: [] }, celebrated: { klant: false, makelaar: false } };

/** Leest bewaarde voortgang en gooit alles weg wat niet (meer) klopt. */
export function parseState(raw: string | null): TourState {
  try {
    const v = JSON.parse(raw ?? 'null');
    if (!v || typeof v !== 'object') return EMPTY_STATE;
    const pick = <T,>(f: (id: TourId) => T): Record<TourId, T> => ({ klant: f('klant'), makelaar: f('makelaar') });
    return {
      open: false,
      tab: v.tab === 'makelaar' ? 'makelaar' : 'klant',
      started: pick((id) => v.started?.[id] === true),
      done: pick((id) => (Array.isArray(v.done?.[id]) ? v.done[id].filter((x: unknown) => TOURS[id].steps.some((s) => s.id === x)) : [])),
      celebrated: pick((id) => v.celebrated?.[id] === true),
    };
  } catch { return EMPTY_STATE; }
}

/** Voegt de stappen toe die bij deze pagina horen (alleen voor een rondleiding die gestart is). */
export function markVisited(state: TourState, path: string): TourState {
  let changed = false;
  const done = { ...state.done };
  for (const id of TOUR_IDS) {
    if (!state.started[id]) continue;
    const add = TOURS[id].steps.filter((s) => s.match(path) && !done[id].includes(s.id)).map((s) => s.id);
    if (add.length) { done[id] = [...done[id], ...add]; changed = true; }
  }
  return changed ? { ...state, done } : state;
}

export const isComplete = (state: TourState, id: TourId) => TOURS[id].steps.every((s) => state.done[id].includes(s.id));
export const currentStep = (state: TourState, id: TourId) => TOURS[id].steps.find((s) => !state.done[id].includes(s.id)) ?? null;
