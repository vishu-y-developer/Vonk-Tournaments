/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobalSearchResult, GlobalSearchCategory } from '@/types';
import { localTournamentRepository } from '@/repositories/local/local-tournament-repository';
import { localTeamRepository } from '@/repositories/local/local-team-repository';
import { localHelpArticleRepository } from '@/repositories/local/local-help-article-repository';

export class GlobalSearchService {
  search(query: string, category?: GlobalSearchCategory): GlobalSearchResult[] {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: GlobalSearchResult[] = [];

    // 1. Search Tournaments
    if (!category || category === 'TOURNAMENTS') {
      const tournaments = localTournamentRepository.getAll();
      tournaments.forEach((t) => {
        const orgName = t.organizer || 'VONK Host';
        if (
          t.title.toLowerCase().includes(q) ||
          t.game.toLowerCase().includes(q) ||
          t.mode.toLowerCase().includes(q) ||
          orgName.toLowerCase().includes(q)
        ) {
          results.push({
            id: `sr-t-${t.id}`,
            category: 'TOURNAMENTS',
            title: t.title,
            subtitle: `${t.game} | ${t.mode} | Hosted by ${orgName}`,
            href: `/tournaments/${t.slug}`,
            badge: t.status,
            iconType: 'Trophy'
          });
        }
      });
    }

    // 2. Search Teams
    if (!category || category === 'TEAMS') {
      const teams = localTeamRepository.getAll();
      teams.forEach((tm) => {
        if (
          tm.name.toLowerCase().includes(q) ||
          tm.shortName.toLowerCase().includes(q) ||
          tm.bio?.toLowerCase().includes(q)
        ) {
          results.push({
            id: `sr-tm-${tm.id}`,
            category: 'TEAMS',
            title: tm.name,
            subtitle: `[${tm.shortName}] | ${tm.members.length} Members | ${tm.preferredMode}`,
            href: `/teams/${tm.id}`,
            badge: tm.readinessStatus,
            iconType: 'Shield'
          });
        }
      });
    }

    // 3. Search Help Center Articles
    if (!category || category === 'HELP') {
      const articles = localHelpArticleRepository.getAll();
      articles.forEach((art) => {
        if (
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.keywords.some((k) => k.toLowerCase().includes(q))
        ) {
          results.push({
            id: `sr-help-${art.id}`,
            category: 'HELP',
            title: art.title,
            subtitle: art.summary,
            href: `/help/${art.slug}`,
            badge: art.category,
            iconType: 'BookOpen'
          });
        }
      });
    }

    return results;
  }
}

export const globalSearchService = new GlobalSearchService();
