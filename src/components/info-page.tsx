import type { ReactNode } from 'react';

export function InfoPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
      <div className="mt-6 space-y-3 leading-relaxed text-ink/90 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_a]:text-brand [&_a]:underline">{children}</div>
    </div>
  );
}
