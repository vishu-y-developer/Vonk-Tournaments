import { useSupport } from '@/providers/SupportProvider';

export const useHelpArticle = (slug: string) => {
  const { getArticle } = useSupport();
  const article = getArticle(slug);
  return { article };
};

export default useHelpArticle;
