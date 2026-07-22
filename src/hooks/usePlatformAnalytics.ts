import { useAdmin } from '@/providers/AdminProvider';

export const usePlatformAnalytics = () => {
  const { analytics } = useAdmin();
  return { analytics };
};

export default usePlatformAnalytics;
