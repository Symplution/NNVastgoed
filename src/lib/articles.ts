// Korte artikelen voor de homepage en /artikelen. Inhoud is algemeen en bedoeld als eerste uitleg, geen persoonlijk advies.
export interface Article {
  slug: string; title: string; tag: 'Kopen' | 'Verkopen' | 'Huren' | 'Nieuwbouw' | 'Wonen' | 'Regio'; summary: string; minutes: number; date: string; body: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'huis-kopen-in-het-noorden', title: 'Een huis kopen in het noorden: dit moet je weten', tag: 'Kopen', minutes: 4, date: '2026-09-28',
    summary: 'Van eerste bezichtiging tot sleuteloverdracht: de stappen op een rij.',
    body: [
      'Wie in Groningen, Friesland of Drenthe een huis koopt, krijgt vaak meer woning voor zijn geld dan in de Randstad. Toch begint het ook hier met goede voorbereiding.',
      'Begin met je budget. Kijk wat je maandelijks kwijt wilt zijn en laat een hypotheekadviseur uitrekenen wat je maximaal kunt lenen. Reken ook de kosten koper mee: overdrachtsbelasting (als die voor jou geldt), notaris, taxatie en eventueel een bouwkundige keuring.',
      'Zet je zoekopdracht op NNvastgoed op en laat je mailen bij nieuw aanbod. Goede woningen zijn snel weg, dus plan een bezichtiging zodra je een woning ziet die past. Dat kan online, zonder bellen.',
      'Bij een bod let je op de vraagprijs, de staat van de woning en wat er in de verkoop is inbegrepen. Na overeenstemming volgt de koopovereenkomst; je hebt dan drie dagen bedenktijd. Daarna regel je de hypotheek en de overdracht bij de notaris.',
    ],
  },
  {
    slug: 'bezichtiging-checklist', title: 'Naar een bezichtiging? Deze 10 dingen check je', tag: 'Kopen', minutes: 3, date: '2026-09-20',
    summary: 'Een korte checklist, zodat je niets vergeet te vragen of te bekijken.',
    body: [
      'Een bezichtiging duurt vaak maar een half uur. Een checklist helpt om niets te missen.',
      'Kijk naar vocht en schimmel in hoeken en onder ramen, de staat van het dak en de goten, het type isolatie en de leeftijd van de cv-ketel. Vraag naar het energielabel en wat de energierekening ongeveer is.',
      'Loop ook buiten rond: hoe is de tuin georiënteerd, is er parkeergelegenheid, hoe ver is het naar school, winkels en het station? Vraag de makelaar wat er in de verkoop is inbegrepen en waarom de verkoper verhuist.',
      'Maak foto’s als dat mag, schrijf je indrukken meteen op en plan zo nodig een tweede bezichtiging, eventueel met een bouwkundige.',
    ],
  },
  {
    slug: 'huren-wat-moet-je-regelen', title: 'Een woning huren: wat moet je regelen?', tag: 'Huren', minutes: 3, date: '2026-09-12',
    summary: 'Inkomenseis, waarborgsom en huurcontract: waar let je op?',
    body: [
      'Verhuurders vragen meestal een inkomen van ongeveer drie keer de maandhuur, een werkgeversverklaring of loonstrook en soms een identiteitsbewijs en een verhuurdersverklaring.',
      'Lees het huurcontract goed: de looptijd, de opzegtermijn, wat in de huur is inbegrepen (gas, water, licht, service) en hoe de huur wordt aangepast. De waarborgsom mag maximaal twee keer de kale maandhuur zijn en moet je na afloop binnen de afgesproken tijd terugkrijgen.',
      'Maak bij de oplevering een rapport met foto’s van de staat van de woning, zodat discussie over schade achteraf niet nodig is.',
    ],
  },
  {
    slug: 'nieuwbouw-voorinschrijving', title: 'Nieuwbouw: zo vergroot je je kans met een voorinschrijving', tag: 'Nieuwbouw', minutes: 3, date: '2026-09-05',
    summary: 'Wat is een voorinschrijving en hoe werkt een loting of selectie?',
    body: [
      'Bij veel nieuwbouwprojecten kun je je vooraf inschrijven. Zo laat je de ontwikkelaar weten dat je interesse hebt en krijg je bericht zodra de verkoop start.',
      'Soms worden woningen verloot, soms verdeeld op basis van lokale binding, inkomen of de volgorde van inschrijving. De voorwaarden staan bij het project; lees ze goed.',
      'Houd rekening met een langere looptijd: je betaalt vaak in termijnen tijdens de bouw. Bespreek met je hypotheekadviseur de bouwdepot en de rente-afspraken voor die periode.',
    ],
  },
  {
    slug: 'huis-verkopen-voorbereiding', title: 'Je huis verkopen? Begin met deze voorbereiding', tag: 'Verkopen', minutes: 4, date: '2026-08-29',
    summary: 'Van waardebepaling tot goede foto’s: zo valt je woning op.',
    body: [
      'Een goede verkoop begint met een realistische vraagprijs. Een makelaar kijkt naar vergelijkbare woningen in de buurt, de staat van je huis en de markt van dat moment.',
      'Zorg dat het huis er goed uitziet: opruimen, kleine reparaties en een schone tuin maken veel verschil. Goede foto’s zijn de eerste indruk, want bijna iedereen begint online.',
      'Weet wat je verkoopt: het energielabel, de bouwtekeningen en eventuele vergunningen moeten klaarliggen. Zo kan een koper snel een weloverwogen bod doen.',
    ],
  },
  {
    slug: 'duurzaam-wonen-subsidies', title: 'Je huis verduurzamen: waar begin je?', tag: 'Wonen', minutes: 3, date: '2026-08-18',
    summary: 'Isolatie, zonnepanelen en warmtepomp: de volgorde die vaak werkt.',
    body: [
      'Begin met isoleren: dak, vloer, muren en glas. Elke winter besparen op stookkosten levert direct iets op en maakt de woning comfortabeler.',
      'Daarna kun je kijken naar zonnepanelen en een warmtepomp. Of die laatste past, hangt af van de isolatie van je huis en het afgiftesysteem.',
      'Er zijn landelijke en soms ook lokale regelingen voor subsidie en leningen. Kijk bij de overheid en je gemeente voor de actuele voorwaarden; die veranderen regelmatig.',
    ],
  },
  {
    slug: 'wonen-in-groningen', title: 'Wonen in Groningen: stad en Ommeland', tag: 'Regio', minutes: 3, date: '2026-08-10',
    summary: 'Levendig in de stad, ruimte en rust in de dorpen eromheen.',
    body: [
      'De stad Groningen is jong en bruisend, met veel studenten, een groot aanbod aan voorzieningen en korte afstanden. Wie ruimte zoekt, vindt die in de dorpen rondom en in het Ommeland.',
      'Dorpen als Haren, Zuidhorn en Bedum zijn populair vanwege de rust en de snelle verbinding met de stad. Verder weg wacht het Hogeland aan de Waddenzee en de Veenkoloniën.',
      'Reken op veel woning voor je geld en altijd een weids uitzicht, maar kijk ook naar lokale ontwikkelingen, zoals nieuwbouwwijken en de gevolgen van aardbevingsschade in delen van de provincie.',
    ],
  },
  {
    slug: 'wonen-in-friesland-en-drenthe', title: 'Wonen in Friesland of Drenthe: water of bos?', tag: 'Regio', minutes: 3, date: '2026-08-02',
    summary: 'Twee provincies, twee werelden: meren en terpen tegenover heide en esdorpen.',
    body: [
      'Friesland staat voor water, dorpen en de Elfsteden. Een woonboerderij bij de Friese meren, een statig pand in Leeuwarden of een huis aan de dijk bij Harlingen: het aanbod is gevarieerd en de eigen taal en cultuur maken het bijzonder.',
      'Drenthe is de groenste provincie, met bossen, heide en brinkdorpen. Er staan veel vrijstaande woningen op ruime kavels, met Assen, Emmen en Hoogeveen als grotere voorzieningenkernen.',
      'Beide provincies zijn goed bereikbaar vanuit de stad Groningen. Kies je liever voor water en boten of voor wandelen en fietsen door het bos? Daar begint de keuze.',
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);
