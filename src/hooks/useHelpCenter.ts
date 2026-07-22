import { useSupport } from '@/providers/SupportProvider';

export const useHelpCenter = () => {
  const { helpArticles, searchHelp } = useSupport();
  return { helpArticles, searchHelp };
};

export default useHelpCenter;
