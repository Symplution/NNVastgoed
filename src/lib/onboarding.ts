import { LISTING_FEE, TOPPER_FEE, euro } from './pricing';
import type { Staff } from './auth';
import { myConnections, myListings, myOffices, viewingRules } from './staff-data';
import { myFavorites, myThreads, myViewings } from './seeker-data';

export interface Step { id: string; title: string; text: string; href: string; cta: string; done: boolean; /** Optioneel: telt niet mee voor de voortgang. */ optional?: boolean }

/** Stappenplan voor een nieuwe makelaar. Elke stap vinkt zichzelf af zodra het echt gebeurd is (de gegevens komen via de sessie, dus alleen van het eigen kantoor). */
export async function staffSteps(staff: Staff): Promise<Step[]> {
  const [offices, connections, listings, rules] = await Promise.all([myOffices(), myConnections(), myListings(), viewingRules()]);
  const office = offices.find((o) => o.id === staff.officeId) ?? null;
  const steps: Step[] = [
    { id: 'kantoor', title: 'Maak je kantoorprofiel compleet', text: 'Upload je logo en vul adres en telefoonnummer in. Je logo komt bij elke woning en op de pdf-brochure.', href: '/beheer/kantoor', cta: 'Kantoorprofiel openen', done: Boolean(office?.logoUrl && office.phone && office.street) },
    { id: 'koppeling', title: 'Koppel je CRM-systeem (bijvoorbeeld Realworks)', text: 'Maak een koppeling en laat je kantoorsoftware of ICT-partner je aanbod naar NNV sturen. Wijzigingen en prijsverlagingen staan er dan direct.', href: '/beheer/koppelingen', cta: 'Koppeling maken', done: connections.some((c) => c.active && c.lastRunAt) },
    { id: 'woning', title: 'Plaats je eerste woning', text: `Voer een woning in met foto's, video en plattegrond, of laat hem via de koppeling binnenkomen. Plaatsen kost eenmalig ${euro(LISTING_FEE.amount)} per woning (excl. btw).`, href: '/beheer/woningen/nieuw', cta: 'Woning plaatsen', done: listings.length > 0 },
    { id: 'bezichtigingen', title: 'Stel je bezichtigingen in', text: 'Kies op welke dagen en tijden zoekers zelf een bezichtiging kunnen plannen, zonder dat je hoeft te bellen.', href: '/beheer/bezichtigingen/beschikbaarheid', cta: 'Beschikbaarheid instellen', done: rules.length > 0 },
    { id: 'promoten', title: 'Maak een woning Topper van de maand', text: `Laat een woning een maand uitgelicht op de homepage staan, voor ${euro(TOPPER_FEE.amount)} extra per woning (excl. btw). In de statistieken zie je wat het oplevert.`, href: '/beheer/woningen', cta: 'Woning kiezen', done: listings.some((l) => l.topperUntil), optional: true },
  ];
  return steps;
}

/** Stappenplan voor een nieuwe woningzoeker. */
export async function seekerSteps(): Promise<Step[]> {
  const [favs, viewings, threads] = await Promise.all([myFavorites(), myViewings(), myThreads()]);
  return [
    { id: 'zoeken', title: 'Zoek een woning', text: 'Zoek op plaats of bekijk de woningen op de kaart. Kopen, huren, nieuwbouw, recreatie en bedrijfsruimte staan bovenin.', href: '/koop', cta: 'Woningen bekijken', done: favs.length > 0 || viewings.length > 0 || threads.length > 0 },
    { id: 'bewaren', title: 'Bewaar je favorieten', text: 'Tik op het hartje bij een woning om hem te bewaren. Je vindt ze hier terug op elk apparaat.', href: '/mijn/favorieten', cta: 'Mijn favorieten', done: favs.length > 0 },
    { id: 'bezichtiging', title: 'Plan een bezichtiging', text: 'Open een woning en kies het tabblad Bezichtiging plannen. Je krijgt direct een bevestiging per mail.', href: '/koop', cta: 'Woning kiezen', done: viewings.length > 0 },
    { id: 'bericht', title: 'Stel een vraag aan de makelaar', text: 'Stuur via de woningpagina een bericht. Het gesprek en het antwoord blijven hier staan.', href: '/mijn/berichten', cta: 'Mijn berichten', done: threads.length > 0 },
  ];
}
