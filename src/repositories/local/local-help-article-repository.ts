import { HelpArticle } from '@/types';
import { HelpArticleRepository } from '../interfaces/help-article-repository';
import { browserStorage } from '@/lib/storage/browser-storage';

export class LocalHelpArticleRepository implements HelpArticleRepository {
  getAll(): HelpArticle[] {
    return browserStorage.getItem<HelpArticle[]>('vonk:v1:help-articles', []);
  }

  getBySlug(slug: string): HelpArticle | null {
    return this.getAll().find((a) => a.slug === slug || a.id === slug) || null;
  }

  getById(id: string): HelpArticle | null {
    return this.getAll().find((a) => a.id === id) || null;
  }

  saveAll(articles: HelpArticle[]): void {
    browserStorage.setItem('vonk:v1:help-articles', articles);
  }
}

export const localHelpArticleRepository = new LocalHelpArticleRepository();
