import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = { title: 'Cookies' };

export default function Cookies() {
  return (
    <InfoPage title="Cookies" intro="Kort gezegd: geen tracking, geen reclame.">
      <p>Het openbare deel van NNvastgoed gebruikt geen tracking- of advertentiecookies. Daarom vragen we ook geen cookietoestemming.</p>
      <h2>Wat we wel gebruiken</h2>
      <ul className="list-disc space-y-1 pl-5"><li><strong>Een sessiecookie</strong> als je inlogt (als woningzoeker of makelaar), zodat je ingelogd blijft.</li><li><strong>Lokale opslag in je browser</strong> voor je favorieten als je niet bent ingelogd. Die blijven op je eigen apparaat.</li></ul>
      <p>Meer over gegevens lees je in de <Link href="/privacy">privacyverklaring</Link>.</p>
    </InfoPage>
  );
}
