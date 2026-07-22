import { useAdmin as useAdminContext } from '@/providers/AdminProvider';

export const useAdmin = () => {
  return useAdminContext();
};

export default useAdmin;
