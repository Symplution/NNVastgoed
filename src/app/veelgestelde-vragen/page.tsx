import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/info-page';

export const metadata: Metadata = { title: 'Veelgestelde vragen' };
const FAQ: [string, string][] = [
  ['Moet ik een account maken om te zoeken?', 'Nee. Zoeken, favorieten bewaren op dit apparaat en een bericht sturen kan zonder account. Met een gratis account vind je je favorieten, bezichtigingen en gesprekken terug op elk apparaat.'],
  ['Hoe plan ik een bezichtiging?', 'Open een woning en kies het tabblad "Bezichtiging plannen". Je ziet de momenten die de makelaar heeft vrijgemaakt, kiest er één en krijgt direct een bevestiging per mail.'],
  ['Kan ik een bezichtiging annuleren?', 'Ja. Dat kan via de link in je bevestigingsmail of in Mijn NNV. De makelaar krijgt bericht.'],
  ['Hoe werkt een zoekopdracht met melding?', 'Stel je filters in en kies "Bewaar zoekopdracht". Na je bevestiging krijg je een mail zodra er nieuwe woningen zijn die erbij passen. Afmelden kan altijd.'],
  ['Hoe chat ik met een makelaar?', 'Stuur een bericht vanaf de woningpagina. Met een account loopt het gesprek door in Mijn NNV, zodat je antwoorden terugvindt.'],
  ['Zijn alle woningen echt beschikbaar?', 'Het aanbod komt van de makelaars zelf en is direct zichtbaar. Verkochte woningen blijven nog even staan met het label Verkocht.'],
  ['Ik ben makelaar. Hoe sluit ik aan?', 'Meld je kantoor aan via de aanmeldpagina. Na controle krijg je een account en kun je woningen invoeren of je software koppelen.'],
];

export default function Vragen() {
  return (
    <InfoPage title="Veelgestelde vragen" intro="Korte antwoorden op wat woningzoekers en makelaars vaak vragen.">
      <div className="divide-y divide-line rounded-2xl border border-line !p-0">
        {FAQ.map(([q, a]) => <details key={q} className="px-5 py-4"><summary className="focus-ring cursor-pointer list-none font-semibold marker:hidden">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}
      </div>
      <p>Staat je vraag er niet bij? Kijk op <Link href="/contact">de contactpagina</Link>.</p>
    </InfoPage>
  );
}
