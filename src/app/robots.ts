import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/beheer', '/mijn', '/api/', '/login', '/inloggen', '/mfa', '/zoekopdracht/', '/bezichtiging/'] }, sitemap: `${siteUrl()}/sitemap.xml` };
}
