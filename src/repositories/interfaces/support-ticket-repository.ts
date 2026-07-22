import { SupportTicket } from '@/types';

export interface SupportTicketRepository {
  getAll(): SupportTicket[];
  getByUserId(userId: string): SupportTicket[];
  getById(id: string): SupportTicket | null;
  save(ticket: SupportTicket): void;
  saveAll(tickets: SupportTicket[]): void;
  clear(): void;
}
