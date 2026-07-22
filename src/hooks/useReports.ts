import { useAdmin } from '@/providers/AdminProvider';

export const useReports = () => {
  const { reports, createReport, resolveReport } = useAdmin();
  return { reports, createReport, resolveReport };
};

export default useReports;
