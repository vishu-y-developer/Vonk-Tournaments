import { useSupport } from '@/providers/SupportProvider';

export const usePlatformStatus = () => {
  const { platformStatus } = useSupport();
  return { platformStatus };
};

export default usePlatformStatus;
