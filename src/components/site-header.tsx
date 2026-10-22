import { AccountMenu } from './account-menu';
import { Logo } from './logo';
import Link from 'next/link';
import { ModeNav } from './mode-nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-8">
          <Logo />
          <div className="hidden sm:block"><ModeNav /></div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/voor-makelaars" className="focus-ring hidden rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-brand-soft hover:text-brand md:inline-flex">Voor makelaars</Link>
          <AccountMenu />
        </div>
      </div>
      <div className="border-t border-line px-4 py-1.5 sm:hidden"><ModeNav /></div>
    </header>
  );
}
