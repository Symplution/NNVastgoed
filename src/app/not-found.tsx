import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand">Deze pagina is er niet (meer)</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">Misschien is de woning verkocht of ingetrokken. Zoek verder in het aanbod van het noorden.</p>
      <Link href="/koop" className="btn-primary mt-6">Bekijk alle woningen</Link>
    </div>
  );
}
