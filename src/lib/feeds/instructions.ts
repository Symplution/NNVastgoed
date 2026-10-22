// Alles wat een ICT-partner of Realworks nodig heeft om aanbod naar NNvastgoed te sturen, als kant-en-klare tekst om door te sturen.
export const FEED_EXAMPLE_JSON = `{
  "volledig": false,
  "woningen": [{
    "id": "RW-10234",
    "status": "beschikbaar",
    "aanbod": "koop",
    "nieuwbouw": false,
    "straat": "Hoofdstraat", "huisnummer": "12", "postcode": "9981 AB", "plaats": "Uithuizen",
    "vraagprijs": 289000, "prijs_type": "k.k.",
    "woonoppervlakte": 140, "perceeloppervlakte": 600, "kamers": 5, "slaapkamers": 3,
    "type": "vrijstaand", "bouwjaar": 1935, "energielabel": "C",
    "omschrijving": "Ruime woning aan de rand van het dorp…",
    "kenmerken": ["Garage", "Zonnepanelen"],
    "fotos": [{ "url": "https://media.jouwkantoor.nl/10234/1.jpg", "omschrijving": "Voorzijde" }]
  }]
}`;

export const FEED_EXAMPLE_XML = `<woningen volledig="false">
  <woning>
    <id>RW-10234</id><status>beschikbaar</status><aanbod>koop</aanbod>
    <straat>Hoofdstraat</straat><huisnummer>12</huisnummer><postcode>9981 AB</postcode><plaats>Uithuizen</plaats>
    <vraagprijs>289000</vraagprijs><prijs_type>k.k.</prijs_type>
    <woonoppervlakte>140</woonoppervlakte><kamers>5</kamers><slaapkamers>3</slaapkamers>
    <type>vrijstaand</type><bouwjaar>1935</bouwjaar><energielabel>C</energielabel>
    <omschrijving>Ruime woning aan de rand van het dorp…</omschrijving>
    <fotos><foto url="https://media.jouwkantoor.nl/10234/1.jpg" omschrijving="Voorzijde"/></fotos>
  </woning>
</woningen>`;

export interface InstructionInput { baseUrl: string; id: string; kind: 'json' | 'xml'; officeName: string; software?: string; /** Alleen bij het aanmaken of vernieuwen bekend. */ secret?: string }

export function partnerInstructions({ baseUrl, id, kind, officeName, software, secret }: InstructionInput): string {
  const url = `${baseUrl}/api/feeds/${id}`;
  const what = software && software !== 'ander' ? software : 'kantoorsoftware';
  return `Koppeling met NNvastgoed (Noord Nederland Vastgoed) voor ${officeName}

Graag het aanbod van ${officeName} vanuit ${what} automatisch naar NNvastgoed sturen, via de koppeling hieronder.

1. Adres (POST)
${url}

2. Inloggegevens (HTTP-header)
Authorization: Bearer ${secret ?? '<geheime sleutel, die heeft de makelaar>'}
Content-Type: ${kind === 'xml' ? 'application/xml' : 'application/json'}

3. Wat er verstuurd wordt
- Het complete aanbod (koop, huur, nieuwbouw, bedrijfsruimte, recreatie) in ${kind === 'xml' ? 'XML' : 'JSON'}, zoals in het voorbeeld hieronder.
- Zet "volledig" op true als altijd het hele aanbod wordt gestuurd: woningen die dan ontbreken gaan automatisch offline.
- Maximaal 500 woningen per aanroep en 8 MB. Bij meer woningen: meerdere aanroepen, met "volledig" op false.
- Alleen woningen in Groningen, Friesland en Drenthe worden geaccepteerd; andere worden afgewezen met een reden.
- Elke woning heeft een vaste eigen "id" (bijvoorbeeld het objectnummer), zodat wijzigingen en prijsverlagingen dezelfde woning bijwerken.
- Foto's en een plattegrond als https-adressen. Foto's worden niet gekopieerd; ze moeten bereikbaar blijven.

4. Antwoord
NNvastgoed antwoordt met het aantal verwerkte woningen en per afgewezen woning de reden. De makelaar ziet dit ook onder Beheer → Koppelingen.

5. Voorbeeld
${kind === 'xml' ? FEED_EXAMPLE_XML : FEED_EXAMPLE_JSON}

Vragen? Neem contact op met ${officeName} of via ${baseUrl}/contact.
`;
}
