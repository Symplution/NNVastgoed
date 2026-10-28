'use client';

import Link from 'next/link';
import { CalendarCheck, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Office } from '@/lib/types';

/** De makelaar naast een woning: logo, naam, telefoonnummer (pas na een klik) en knoppen om contact op te nemen of een bezichtiging aan te vragen. */
export function OfficeCard({ office, bookable, children }: { office: Pick<Office, 'name' | 'slug' | 'city' | 'street' | 'postcode' | 'phone' | 'email' | 'nvmMember' | 'logoUrl' | 'bannerUrl'>; bookable: boolean; children: ReactNode }) {
  const [phone, setPhone] = useState(false);
  const [form, setForm] = useState(false);
  const bookingTab = () => { window.location.hash = 'bezichtigen'; document.getElementById('tab-bezichtigen')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  return (
    <section className="card overflow-hidden" aria-labelledby="makelaar">
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-[#1c6a93]">
        {office.bannerUrl
          ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={office.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          : <><span aria-hidden className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" /><span aria-hidden className="absolute bottom-[-2.5rem] left-1/3 h-24 w-24 rounded-full bg-accent/30" /></>}
        {office.nvmMember && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand"><ShieldCheck size={14} aria-hidden /> NVM</span>}
      </div>
      <div className="px-5 pb-5">
        <div className="relative z-10 -mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-2 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {office.logoUrl ? <img src={office.logoUrl} alt={`Logo van ${office.name}`} className="max-h-full max-w-full object-contain" /> : <span aria-hidden className="text-3xl font-extrabold text-brand">{office.name.charAt(0)}</span>}
        </div>
        <h2 id="makelaar" className="mt-3 text-xl font-extrabold leading-tight"><Link href={`/makelaars/${office.slug}`} className="hover:underline">{office.name}</Link></h2>
        <p className="mt-0.5 flex items-start gap-1.5 text-sm text-muted"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden /> {office.street && `${office.street}, `}{office.postcode} {office.city}</p>

        {office.phone && (
          phone
            ? <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="mt-4 inline-flex items-center gap-2 text-[17px] font-semibold text-brand hover:underline"><Phone size={18} aria-hidden /> {office.phone}</a>
            : <button type="button" onClick={() => setPhone(true)} className="focus-ring mt-4 inline-flex items-center gap-2 rounded text-[17px] font-semibold text-brand hover:underline"><Phone size={18} aria-hidden /> Toon telefoonnummer</button>
        )}

        <button type="button" onClick={() => setForm((v) => !v)} aria-expanded={form} aria-controls="contact-formulier" className="btn-accent mt-5 w-full !py-3 text-base"><Mail size={18} aria-hidden /> Neem contact op</button>
        <div id="contact-formulier" hidden={!form} className="mt-4 border-t border-line pt-4">{children}</div>
        {bookable && <button type="button" onClick={bookingTab} className="focus-ring mx-auto mt-4 flex items-center gap-2 rounded text-[17px] font-semibold text-brand hover:underline"><CalendarCheck size={18} aria-hidden /> Vraag bezichtiging aan</button>}
      </div>
    </section>
  );
}
