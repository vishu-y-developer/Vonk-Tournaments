import { HelpArticle } from '@/types';

export interface HelpArticleRepository {
  getAll(): HelpArticle[];
  getBySlug(slug: string): HelpArticle | null;
  getById(id: string): HelpArticle | null;
  saveAll(articles: HelpArticle[]): void;
}
