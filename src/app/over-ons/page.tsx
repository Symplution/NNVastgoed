import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = { title: 'Over NNvastgoed' };

export default function OverOns() {
  return (
    <InfoPage title="Over NNvastgoed" intro="NNvastgoed (Noord Nederland Vastgoed) is het woningportaal voor Groningen, Friesland en Drenthe.">
      <p>We laten het aanbod van makelaars uit het noorden op één plek zien: koop, huur, nieuwbouw en bedrijfsruimte. Geen ruis uit de rest van het land, maar woningen waar je echt kunt wonen.</p>
      <h2>Voor woningzoekers</h2>
      <p>Zoek op plaats, prijs en kenmerken, bekijk het aanbod op de kaart, bewaar favorieten en laat je mailen bij nieuw aanbod. Met een gratis account plan je bezichtigingen en chat je met de makelaar.</p>
      <h2>Voor makelaars</h2>
      <p>Makelaars sluiten hun kantoor aan, voeren woningen in of koppelen hun kantoorsoftware, en ontvangen leads, bezichtigingen en berichten in één beheer. <Link href="/voor-makelaars/aanmelden">Meld je kantoor aan</Link>.</p>
      <h2>Onze afspraken</h2>
      <ul className="list-disc space-y-1 pl-5"><li>Alleen aanbod in Groningen, Friesland en Drenthe.</li><li>Een woning staat er zoals de makelaar hem aanlevert; wijzigingen zijn direct zichtbaar.</li><li>Zorgvuldig met gegevens: lees de <Link href="/privacy">privacyverklaring</Link>.</li></ul>
    </InfoPage>
  );
}
