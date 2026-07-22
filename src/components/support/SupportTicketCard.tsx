'use client';

import React from 'react';
import Link from 'next/link';
import { SupportTicket } from '@/types';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { LifeBuoy, ArrowRight } from 'lucide-react';

export const SupportTicketCard: React.FC<{ ticket: SupportTicket }> = ({ ticket }) => {
  return (
    <div className="p-4 rounded-xl border border-card-border bg-card-bg/20 flex flex-col gap-3 hover:border-card-hover-border transition-all">
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col">
          <span className="font-extrabold text-foreground text-xs">{ticket.subject}</span>
          <span className="text-[10px] text-muted font-mono">
            Ticket #{ticket.id} | Created: {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </div>
        <UserStatusBadge status={ticket.status} />
      </div>

      <p className="text-xs text-muted line-clamp-2">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-card-border">
        <span className="text-[10px] text-muted font-semibold">
          Category: {ticket.category}
        </span>
        <Link
          href={`/support/tickets/${ticket.id}`}
          className="flex items-center gap-1 text-xs font-extrabold text-secondary hover:underline"
        >
          View Conversation
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default SupportTicketCard;
