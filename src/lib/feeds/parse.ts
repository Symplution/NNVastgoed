import { XMLParser } from 'fast-xml-parser';
import { normalizeAll } from './normalize';
import type { Parsed } from './types';

export interface ParsedFeed extends Parsed { full: boolean }

/** JSON: { "volledig": false, "woningen": [ … ] }  — ook een kale lijst is goed. */
export function parseJsonFeed(body: unknown, scope: string): ParsedFeed {
  const list = Array.isArray(body) ? body : (body as { woningen?: unknown })?.woningen;
  if (!Array.isArray(list)) throw new Error('Verwacht een object met een lijst "woningen".');
  return { ...normalizeAll(list, scope), full: !Array.isArray(body) && (body as { volledig?: unknown }).volledig === true };
}

/** XML: <woningen volledig="false"><woning><id>…</id><straat>…</straat> … <fotos><foto url="…" omschrijving="…"/></fotos></woning></woningen> */
export function parseXmlFeed(xml: string, scope: string): ParsedFeed {
  const parser = new XMLParser({
    ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false, trimValues: true,
    isArray: (name) => ['woning', 'foto', 'kenmerk'].includes(name),
  });
  const root = parser.parse(xml)?.woningen;
  if (!root || typeof root !== 'object') throw new Error('Verwacht een XML-document met <woningen>.');
  const list = (root.woning ?? []).map((w: Record<string, any>) => ({
    ...w,
    fotos: (w.fotos?.foto ?? []).map((f: any) => (typeof f === 'string' ? { url: f } : { url: f['@_url'] ?? f['#text'], omschrijving: f['@_omschrijving'] })),
    kenmerken: (w.kenmerken?.kenmerk ?? []).map((k: any) => (typeof k === 'string' ? k : k['#text'])),
  }));
  return { ...normalizeAll(list, scope), full: root['@_volledig'] === 'true' };
}
