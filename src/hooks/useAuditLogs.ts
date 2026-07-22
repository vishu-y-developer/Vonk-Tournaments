import { useAdmin } from '@/providers/AdminProvider';

export const useAuditLogs = () => {
  const { auditLogs } = useAdmin();
  return { auditLogs };
};

export default useAuditLogs;
