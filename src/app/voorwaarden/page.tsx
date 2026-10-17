import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = { title: 'Gebruiksvoorwaarden' };

export default function Voorwaarden() {
  return (
    <InfoPage title="Gebruiksvoorwaarden" intro="De afspraken voor het gebruik van NNvastgoed.">
      <h2>Het aanbod</h2>
      <p>Woningen, prijzen en foto’s worden aangeleverd door makelaars. Wij proberen het aanbod actueel te houden, maar kunnen niet garanderen dat alle informatie volledig en foutloos is. Aan de weergave op deze site kun je geen rechten ontlenen; de makelaar van de woning is leidend.</p>
      <h2>Je account</h2>
      <p>Je bent verantwoordelijk voor je inloggegevens. Gebruik je eigen gegevens en misbruik de contact- en berichtenfuncties niet voor reclame of ongewenste mail.</p>
      <h2>Berichten en bezichtigingen</h2>
      <p>Een bericht of bezichtiging gaat naar de makelaar van de woning. Afspraken over een bezichtiging maak je met de makelaar; je kunt een afspraak altijd annuleren.</p>
      <h2>Makelaars</h2>
      <p>Een aangesloten kantoor is verantwoordelijk voor de juistheid van het eigen aanbod en voor het correct omgaan met de gegevens van zoekers. Aanbod buiten Groningen, Friesland en Drenthe wordt niet geaccepteerd.</p>
      <h2>Privacy</h2>
      <p>Hoe we met gegevens omgaan, staat in de <Link href="/privacy">privacyverklaring</Link>.</p>
    </InfoPage>
  );
}
