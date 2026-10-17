import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Logo } from './logo';
import { PROVINCES } from '@/lib/types';
import { provinceName } from '@/lib/regions';

export function SiteHeader() {
  const link = 'focus-ring rounded-md px-2.5 py-1.5 text-sm font-medium text-ink hover:bg-brand-soft hover:text-brand';
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Hoofdmenu" className="flex items-center gap-0.5">
          <Link href="/koop" className={link}>Koop</Link>
          <span className="hidden items-center sm:flex">
            {PROVINCES.map((p) => <Link key={p} href={`/${p}`} className={link}>{provinceName(p)}</Link>)}
          </span>
          <Link href="/makelaars" className={link}>Makelaars</Link>
          <Link href="/bewaard" className={`${link} inline-flex items-center gap-1.5`} aria-label="Bewaarde woningen"><Heart size={16} aria-hidden /><span className="hidden sm:inline">Bewaard</span></Link>
          <Link href="/voor-makelaars" className="btn-primary ml-2 hidden !py-1.5 md:inline-flex">Voor makelaars</Link>
        </nav>
      </div>
    </header>
  );
}
