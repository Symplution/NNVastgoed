import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = { title: 'Contact' };
const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default function Contact() {
  return (
    <InfoPage title="Contact" intro="Een vraag over een woning, je account of aansluiten als makelaar?">
      <h2>Over een woning</h2>
      <p>Stuur een bericht via de woningpagina, dan komt je vraag rechtstreeks bij de makelaar die de woning aanbiedt. Met een account zie je het gesprek terug bij <Link href="/mijn/berichten">Mijn NNV</Link>.</p>
      <h2>Over NNvastgoed</h2>
      <p>{contact ? <>Mail ons via <a href={`mailto:${contact}`}>{contact}</a>.</> : 'Neem contact met ons op via het kantoor waar je woning of vraag bij hoort.'} We reageren zo snel mogelijk, meestal binnen twee werkdagen.</p>
      <h2>Makelaar?</h2>
      <p>Meld je kantoor aan via <Link href="/voor-makelaars/aanmelden">de aanmeldpagina</Link>, of log in via <Link href="/login">het makelaarsbeheer</Link>.</p>
    </InfoPage>
  );
}
