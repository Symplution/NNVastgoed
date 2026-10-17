import { matches, parseFilters } from './search';
import type { Listing } from './types';

/** Nieuwe woningen sinds de vorige melding die bij een zoekopdracht passen. */
export const newMatches = (listings: Listing[], qs: string, since: string): Listing[] => {
  const f = parseFilters(new URLSearchParams(qs));
  return listings.filter((l) => (l.publishedAt ?? l.updatedAt) > since && matches(l, f));
};

