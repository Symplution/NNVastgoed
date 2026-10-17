import type { MetadataRoute } from 'next';
import { listOffices, publicSlugs } from '@/lib/data';
import { siteUrl } from '@/lib/env';
import { PROVINCES } from '@/lib/types';
import { ARTICLES } from '@/lib/articles';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [slugs, offices] = await Promise.all([publicSlugs(), listOffices()]);
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/koop`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/huur`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/nieuwbouw`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/bedrijfsruimte`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/woningmarkt`, changeFrequency: 'daily', priority: 0.6 },
    ...PROVINCES.map((p) => ({ url: `${base}/${p}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    { url: `${base}/makelaars`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/voor-makelaars`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/voor-makelaars/aanmelden`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/artikelen`, changeFrequency: 'weekly', priority: 0.5 },
    ...ARTICLES.map((a) => ({ url: `${base}/artikelen/${a.slug}`, lastModified: a.date, changeFrequency: 'monthly' as const, priority: 0.4 })),
    ...['over-ons', 'contact', 'veelgestelde-vragen'].map((p) => ({ url: `${base}/${p}`, changeFrequency: 'monthly' as const, priority: 0.3 })),
    ...offices.map((o) => ({ url: `${base}/makelaars/${o.slug}`, changeFrequency: 'weekly' as const, priority: 0.5 })),
    ...slugs.map((s) => ({ url: `${base}/woning/${s.slug}`, lastModified: s.updatedAt, changeFrequency: 'daily' as const, priority: 0.7 })),
  ];
}
