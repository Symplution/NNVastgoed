// Tarieven voor makelaars (alle bedragen excl. btw). Eén plek om ze aan te passen.
export const REGISTRATION = { name: 'Registreren', note: 'Een kantoor aansluiten is gratis.' };

/** Een woning plaatsen: eenmalig per woning (koop, huur, nieuwbouw, recreatie of bedrijfsruimte). */
export const LISTING_FEE = { name: 'Woning plaatsen', amount: 250, note: 'Eenmalig per woning, zolang de woning online staat. Geen abonnement.' };

/** Een woning extra promoten: uitgelicht in het aanbod van de maand. */
export const PROMO_FEE = { name: 'Aanbod van de maand', amount: 50, boost: 5, note: 'Per woning, voor een maand. Je woning staat uitgelicht op de homepage.' };

export const euro = (n: number) => `€ ${n.toLocaleString('nl-NL')}`;
