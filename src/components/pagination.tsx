import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { filtersToParams, PAGE_SIZE, type SearchFilters } from '@/lib/search';

export function Pagination({ filters, total, base = '/koop' }: { filters: SearchFilters; total: number; base?: string }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  const href = (page: number) => { const q = filtersToParams({ ...filters, page }).toString(); return q ? `${base}?${q}` : base; };
  const cur = filters.page;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - cur) <= 1);
  const item = 'focus-ring inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold';
  return (
    <nav aria-label="Paginering" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {cur > 1 && <Link href={href(cur - 1)} className={`${item} border-line hover:bg-sand`} rel="prev"><ChevronLeft size={16} aria-hidden /> Vorige</Link>}
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1] > 1 && <span aria-hidden className="text-muted">…</span>}
          <Link href={href(n)} aria-current={n === cur ? 'page' : undefined} className={`${item} ${n === cur ? 'border-brand bg-brand text-white' : 'border-line hover:bg-sand'}`}>{n}</Link>
        </span>
      ))}
      {cur < pages && <Link href={href(cur + 1)} className={`${item} border-line hover:bg-sand`} rel="next">Volgende <ChevronRight size={16} aria-hidden /></Link>}
    </nav>
  );
}
