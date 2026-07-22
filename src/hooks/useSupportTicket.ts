import { useSupport } from '@/providers/SupportProvider';

export const useSupportTicket = (ticketId: string) => {
  const { tickets, addReply, updateStatus } = useSupport();
  const ticket = tickets.find((t) => t.id === ticketId) || null;
  return {
    ticket,
    addReply: (msg: string) => addReply(ticketId, msg),
    closeTicket: () => updateStatus(ticketId, 'CLOSED'),
    reopenTicket: () => updateStatus(ticketId, 'REOPENED')
  };
};

export default useSupportTicket;
