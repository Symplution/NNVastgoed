import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = { title: 'Toegankelijkheid' };

export default function Toegankelijkheid() {
  return (
    <InfoPage title="Toegankelijkheid" intro="NNvastgoed is bedoeld voor iedereen.">
      <p>We bouwen de site zo dat je hem kunt gebruiken met toetsenbord, schermlezer en op elk apparaat. Keuzemenu’s, formulieren en de kaart zijn met het toetsenbord te bedienen, en de woningen zijn ook als lijst te bekijken.</p>
      <h2>Iets werkt niet?</h2>
      <p>Merk je een probleem of mis je iets? Laat het ons weten via <Link href="/contact">de contactpagina</Link>, dan lossen we het zo snel mogelijk op.</p>
    </InfoPage>
  );
}
