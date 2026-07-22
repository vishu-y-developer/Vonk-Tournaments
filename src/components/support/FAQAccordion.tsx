'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I register for a custom-room tournament?',
      a: 'Navigate to Tournaments, select an open tournament, choose your team roster or solo registration, and submit. If there is an entry fee, it is deducted from your demo wallet.'
    },
    {
      q: 'How does the demo wallet work?',
      a: 'The demo wallet is 100% simulated. No real money, credit cards, or UPI are involved. Entry fees, refunds, and winning payouts are updated locally.'
    },
    {
      q: 'When are room credentials released?',
      a: 'Room ID and Password are published by the organizer approximately 15 minutes before the match start time. You will receive an in-app alert.'
    },
    {
      q: 'How do organizer and admin modes work?',
      a: 'You can switch your role between Player, Organizer, and Admin using the floating Demo Role Switcher at the bottom right.'
    },
    {
      q: 'How do demo refunds work?',
      a: 'If an organizer rejects your registration or cancels a match, the entry fee is credited back instantly to your local wallet.'
    }
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-extrabold uppercase text-foreground flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-secondary" />
        Frequently Asked Questions
      </h3>

      <div className="flex flex-col gap-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={faq.q}
              className="border border-card-border rounded-xl bg-card-bg/20 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 flex justify-between items-center text-left text-xs font-extrabold text-foreground hover:bg-card-bg/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted transition-transform ${isOpen ? 'rotate-180 text-secondary' : ''}`} />
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-muted leading-relaxed border-t border-card-border/50 bg-card-bg/10">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQAccordion;
