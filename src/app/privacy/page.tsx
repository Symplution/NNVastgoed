import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacyverklaring' };

const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Privacy() {
  const h2 = 'mt-8 text-xl font-bold';
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacyverklaring</h1>
      <div className="mt-6 space-y-3 leading-relaxed text-ink/90">
        <p>NNvastgoed (Noord Nederland Vastgoed) toont woningen van makelaars in Groningen, Friesland en Drenthe. Hieronder staat welke gegevens we verwerken en waarom.</p>
        <h2 className={h2}>Als je een bericht stuurt over een woning</h2>
        <p>We bewaren je naam, e-mailadres, eventueel telefoonnummer en je bericht. Ze gaan naar de makelaar die de woning aanbiedt, zodat die contact met je kan opnemen. Grondslag: je toestemming (je vinkt die aan in het formulier).</p>
        <h2 className={h2}>Als je een zoekopdracht opslaat</h2>
        <p>We bewaren je e-mailadres en je zoekcriteria om je te mailen bij nieuw aanbod. Je krijgt eerst een bevestigingsmail en elke melding bevat een afmeldlink. Grondslag: je toestemming.</p>
        <h2 className={h2}>Als je een bezichtiging plant</h2>
        <p>We bewaren je naam, e-mailadres, eventueel telefoonnummer, je opmerking en het gekozen moment. Ze gaan naar de makelaar van de woning, die je verwacht. Je krijgt een bevestiging per mail met een link om de bezichtiging te bekijken of te annuleren. Grondslag: uitvoering van je verzoek en je toestemming.</p>
        <h2 className={h2}>Als je een account maakt</h2>
        <p>Met een account bewaren we je naam, e-mailadres, eventueel telefoonnummer, je favorieten, je bezichtigingen en je berichten met makelaars. Een makelaar ziet je naam, e-mailadres en telefoonnummer alleen als jij zelf een gesprek met zijn kantoor begint of een bezichtiging bij hem plant. Je kunt je account en gegevens laten verwijderen.</p>
        <h2 className={h2}>Favorieten zonder account</h2>
        <p>Woningen die je met het hartje bewaart zonder in te loggen, staan alleen in je eigen browser. Daarvoor is geen account nodig en wij ontvangen dit niet.</p>
        <h2 className={h2}>Cookies</h2>
        <p>Het openbare deel van deze site gebruikt geen tracking- of advertentiecookies. Alleen mensen die inloggen (zoekers en makelaars) krijgen een functionele sessiecookie.</p>
        <h2 className={h2}>Bewaartermijn en je rechten</h2>
        <p>Je kunt altijd vragen om inzage, correctie of verwijdering van je gegevens, of je toestemming intrekken.{contact ? <> Mail naar <a className="underline" href={`mailto:${contact}`}>{contact}</a>.</> : ' Neem hiervoor contact met ons op.'} Je hebt ook het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens.</p>
        <h2 className={h2}>Waar staan de gegevens</h2>
        <p>In een database van Supabase in de Europese Unie (Frankfurt). E-mail wordt verstuurd via een e-mailprovider; die ontvangt alleen het adres en de inhoud van de mail.</p>
      </div>
    </div>
  );
}
