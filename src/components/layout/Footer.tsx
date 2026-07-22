'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES, LEGAL_DISCLAIMER } from '@/constants';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#040407] border-t border-card-border px-6 py-8 md:py-12 flex flex-col items-center gap-6 safe-bottom">
      {/* Brand logo & tagline */}
      <div className="flex flex-col items-center text-center gap-2">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tighter text-gradient">
            VONK
          </span>
          <span className="text-xs uppercase tracking-widest text-muted border-l border-card-border pl-2 font-bold">
            Tournaments
          </span>
        </Link>
        <p className="text-xs text-muted font-medium italic">Compete. Conquer. Win.</p>
      </div>

      {/* Useful links */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-foreground/70 font-semibold">
        <Link href={ROUTES.RULES} className="hover:text-primary transition-colors">
          Rules & Fair Play
        </Link>
        <Link href={ROUTES.TERMS} className="hover:text-primary transition-colors">
          Terms & Disclaimers
        </Link>
        <Link href={ROUTES.SUPPORT} className="hover:text-primary transition-colors">
          Support & Disputes
        </Link>
      </div>

      {/* Legal Disclaimer Box */}
      <div className="max-w-2xl px-4 py-3 rounded-lg bg-card-bg/40 border border-card-border text-[11px] text-muted text-center leading-relaxed">
        <div className="flex items-center justify-center gap-1.5 text-danger font-semibold mb-1 uppercase tracking-wider text-[10px]">
          <Shield className="h-3.5 w-3.5" />
          Disclaimer & Simulation Notice
        </div>
        {LEGAL_DISCLAIMER}
      </div>

      {/* Copyright */}
      <p className="text-[10px] text-muted/60 font-semibold mt-2">
        &copy; {new Date().getFullYear()} VONK Tournaments. Designed for mobile-first competitive gaming.
      </p>
    </footer>
  );
};

export default Footer;
