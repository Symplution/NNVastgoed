import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { siteUrl } from '@/lib/env';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: 'NNvastgoed — koopwoningen in Groningen, Friesland en Drenthe', template: '%s · NNvastgoed' },
  description: 'Zoek je nieuwe huis in het noorden. NNvastgoed (Noord Nederlands Vastgoed) toont het aanbod van makelaars in Groningen, Friesland en Drenthe.',
  openGraph: { siteName: 'NNvastgoed', locale: 'nl_NL', type: 'website' },
};
export const viewport: Viewport = { themeColor: '#0e4a6e', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="flex min-h-screen flex-col">
        <a href="#inhoud" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">Naar de inhoud</a>
        <SiteHeader />
        <main id="inhoud" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
