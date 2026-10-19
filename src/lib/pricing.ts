// Tarieven voor makelaars (alle bedragen excl. btw). Eén plek om ze aan te passen.
export const REGISTRATION = { name: 'Registreren', note: 'Een kantoor aansluiten is gratis.' };

/** Een woning plaatsen: eenmalig per woning (koop, huur, nieuwbouw, recreatie of bedrijfsruimte). */
export const LISTING_FEE = { name: 'Woning plaatsen', amount: 250, note: 'Eenmalig per woning, zolang de woning online staat. Geen abonnement.' };

/** Een woning extra laten opvallen: Topper van de maand, per woning en voor één maand. */
export const TOPPER_FEE = { name: 'Topper van de maand', amount: 75, days: 31, note: 'Meerprijs per woning, voor één maand. Geen abonnement en geen vaste kosten.' };

export const euro = (n: number) => `€ ${n.toLocaleString('nl-NL')}`;
