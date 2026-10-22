import { describe, expect, it } from 'vitest';
import { partnerInstructions } from '../src/lib/feeds/instructions';
import { parseJsonFeed, parseXmlFeed } from '../src/lib/feeds/parse';
import { FEED_EXAMPLE_JSON, FEED_EXAMPLE_XML } from '../src/lib/feeds/instructions';

describe('instructie voor de ICT-partner', () => {
  const base = { baseUrl: 'https://nnvastgoed.nl', id: 'abc', kind: 'json' as const, officeName: 'Martinihof Makelaars' };
  it('bevat het adres en de sleutel, en zonder sleutel een aanwijzing', () => {
    const met = partnerInstructions({ ...base, secret: 'GEHEIM-123', software: 'Realworks' });
    expect(met).toContain('https://nnvastgoed.nl/api/feeds/abc');
    expect(met).toContain('Bearer GEHEIM-123');
    expect(met).toContain('Realworks');
    const zonder = partnerInstructions(base);
    expect(zonder).not.toContain('GEHEIM');
    expect(zonder).toContain('geheime sleutel');
  });
  it('past het voorbeeld en het formaat aan op JSON of XML', () => {
    expect(partnerInstructions(base)).toContain('application/json');
    const xml = partnerInstructions({ ...base, kind: 'xml' });
    expect(xml).toContain('application/xml');
    expect(xml).toContain('<woningen volledig="false">');
  });
  it('de voorbeelden in de instructie worden zelf ook echt geaccepteerd', () => {
    const json = parseJsonFeed(JSON.parse(FEED_EXAMPLE_JSON), 'scope');
    expect(json.rejected).toEqual([]);
    expect(json.items).toHaveLength(1);
    const xml = parseXmlFeed(FEED_EXAMPLE_XML, 'scope');
    expect(xml.rejected).toEqual([]);
    expect(xml.items).toHaveLength(1);
  });
});
