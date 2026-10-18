import { PROVINCES, type Listing, type Province } from './types';

export interface ProvinceStat { province: Province; count: number; avgPrice: number | null; avgPerM2: number | null }
export interface MarketStats {
  koop: number; huur: number; nieuwbouw: number; bedrijfsruimte: number; recreatie: number;
  avgRent: number | null;
  provinces: ProvinceStat[];
}

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

/** Cijfers uit het aanbod op NNvastgoed: alleen woningen die nu te koop of te huur staan. Geen officiële statistiek. */
export function marketStats(all: Listing[]): MarketStats {
  const live = all.filter((l) => ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(l.status));
  const koopHomes = live.filter((l) => l.offer === 'koop' && l.category === 'woning');
  const rentHomes = live.filter((l) => l.offer === 'huur' && l.category === 'woning');
  return {
    koop: koopHomes.length, huur: rentHomes.length, nieuwbouw: live.filter((l) => l.newBuild).length, bedrijfsruimte: live.filter((l) => l.category === 'bedrijfsruimte').length, recreatie: live.filter((l) => l.category === 'recreatie').length,
    avgRent: avg(rentHomes.map((l) => l.askingPrice)),
    provinces: PROVINCES.map((province) => {
      const own = koopHomes.filter((l) => l.province === province);
      const withArea = own.filter((l) => l.livingArea > 0);
      return {
        province, count: own.length, avgPrice: avg(own.map((l) => l.askingPrice)),
        avgPerM2: avg(withArea.map((l) => l.askingPrice / l.livingArea)),
      };
    }),
  };
}
