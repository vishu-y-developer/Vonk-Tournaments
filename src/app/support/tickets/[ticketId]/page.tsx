'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSupportTicket } from '@/hooks/useSupportTicket';
import DemoSupportNotice from '@/components/support/DemoSupportNotice';
import UserStatusBadge from '@/components/admin/UserStatusBadge';
import { Ticket, Send, ArrowLeft, CheckCircle2, RotateCcw, Bot } from 'lucide-react';

export default function SupportTicketDetailPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string;
  const { ticket, addReply, closeTicket, reopenTicket } = useSupportTicket(ticketId);

  const [message, setMessage] = useState('');

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <Ticket className="h-10 w-10 text-muted" />
        <h2 className="text-lg font-extrabold text-foreground">Support Ticket Not Found</h2>
        <Link href="/support/tickets" className="text-xs text-secondary font-bold hover:underline">
          Return to Ticket History
        </Link>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addReply(message);
    setMessage('');
  };

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  return (
    <div className="flex flex-col gap-6 py-4 max-w-4xl mx-auto">
      <DemoSupportNotice />

      <Link href="/support/tickets" className="flex items-center gap-1 text-xs text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Support Tickets
      </Link>

      <div className="p-6 rounded-2xl border border-card-border bg-card-bg/25 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted">Ticket #{ticket.id}</span>
              <UserStatusBadge status={ticket.status} />
            </div>
            <h1 className="text-xl font-extrabold text-foreground mt-1">{ticket.subject}</h1>
            <span className="text-[10px] text-muted font-semibold">
              Category: {ticket.category} | Priority: {ticket.priority} | Created: {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            {isClosed ? (
              <button
                onClick={reopenTicket}
                className="px-3 py-1.5 bg-card-bg border border-card-border text-foreground hover:bg-card-bg/50 rounded-xl text-xs font-extrabold flex items-center gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reopen Ticket
              </button>
            ) : (
              <button
                onClick={closeTicket}
                className="px-3 py-1.5 bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30 rounded-xl text-xs font-extrabold flex items-center gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Close Ticket
              </button>
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="flex flex-col gap-3 py-4 border-t border-b border-card-border/50 max-h-[500px] overflow-y-auto pr-2">
          {ticket.messages.map((m) => {
            const isUser = m.authorType === 'USER';
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl max-w-[85%] flex flex-col gap-1 ${
                  isUser
                    ? 'self-end bg-secondary/15 border border-secondary/30 text-foreground'
                    : 'self-start bg-card-bg/60 border border-card-border text-foreground'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-black flex items-center gap-1">
                    {!isUser && <Bot className="h-3.5 w-3.5 text-secondary" />}
                    {m.authorName} ({m.authorType})
                  </span>
                  <span className="text-[9px] text-muted font-mono">{new Date(m.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-line">{m.message}</p>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        {!isClosed ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your response..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-3 bg-card-bg/60 border border-card-border rounded-xl text-xs text-foreground focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-secondary hover:bg-secondary/95 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" /> Send Reply
            </button>
          </form>
        ) : (
          <div className="p-3 text-center text-xs text-muted font-semibold bg-card-bg/10 rounded-xl border border-card-border">
            This ticket is closed. Reopen the ticket to send additional replies.
          </div>
        )}
      </div>
    </div>
  );
}
