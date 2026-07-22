import { SupportTicket } from '@/types';
import { SupportTicketRepository } from '../interfaces/support-ticket-repository';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';

export class LocalSupportTicketRepository implements SupportTicketRepository {
  getAll(): SupportTicket[] {
    return browserStorage.getItem<SupportTicket[]>(STORAGE_KEYS.SUPPORT_TICKETS, []);
  }

  getByUserId(userId: string): SupportTicket[] {
    return this.getAll().filter((t) => t.userId === userId);
  }

  getById(id: string): SupportTicket | null {
    return this.getAll().find((t) => t.id === id) || null;
  }

  save(ticket: SupportTicket): void {
    const tickets = this.getAll();
    const idx = tickets.findIndex((t) => t.id === ticket.id);
    if (idx > -1) {
      tickets[idx] = ticket;
    } else {
      tickets.unshift(ticket);
    }
    browserStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
  }

  saveAll(tickets: SupportTicket[]): void {
    browserStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
  }

  clear(): void {
    browserStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, []);
  }
}

export const localSupportTicketRepository = new LocalSupportTicketRepository();
