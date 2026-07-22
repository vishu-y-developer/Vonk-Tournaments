import { useSupport } from '@/providers/SupportProvider';

export const useSupportTickets = () => {
  const { tickets, createTicket, updateStatus } = useSupport();
  return { tickets, createTicket, updateStatus };
};

export default useSupportTickets;
