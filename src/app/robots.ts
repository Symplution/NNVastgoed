import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/beheer', '/api/', '/login', '/mfa', '/zoekopdracht/'] }, sitemap: `${siteUrl()}/sitemap.xml` };
}
