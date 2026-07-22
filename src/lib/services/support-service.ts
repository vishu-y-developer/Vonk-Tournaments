/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SupportTicket,
  SupportMessage,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  HelpArticle,
  HelpCategory,
  IssueReport,
  IssueType,
  IssueSeverity,
  PlatformSystemStatus
} from '@/types';
import { localSupportTicketRepository } from '@/repositories/local/local-support-ticket-repository';
import { localHelpArticleRepository } from '@/repositories/local/local-help-article-repository';
import { localIssueReportRepository } from '@/repositories/local/local-issue-report-repository';
import { localPlatformStatusRepository } from '@/repositories/local/local-platform-status-repository';
import { browserStorage } from '@/lib/storage/browser-storage';

export class SupportService {
  // --- HELP ARTICLES ---
  getHelpArticles(): HelpArticle[] {
    const list = localHelpArticleRepository.getAll();
    if (list.length > 0) return list;

    // Seed help articles if empty
    const seedArticles: HelpArticle[] = [
      {
        id: 'article-1',
        slug: 'getting-started-vonk',
        title: 'Getting Started with VONK Tournaments',
        summary: 'Learn how to create a player profile, join teams, and register for custom-room tournaments.',
        category: 'Getting Started',
        content: `### Welcome to VONK Tournaments!

VONK Tournaments is a premium esports platform designed for competitive custom-room matches.

#### Quick Start Checklist:
1. **Create Profile**: Set your In-Game Name (IGN) and BGMI Character ID in Profile.
2. **Join or Create a Team**: Form a 4-player Squad in Teams.
3. **Register for Tournaments**: Browse open tournaments and submit your roster.
4. **Match Center**: Retrieve Room ID and Password 15 minutes prior to match time.`,
        relatedArticleIds: ['article-2', 'article-3'],
        keywords: ['register', 'tournament', 'bgmi', 'getting started', 'room id'],
        updatedAt: new Date().toISOString(),
        audience: 'ALL',
        isDemo: true
      },
      {
        id: 'article-2',
        slug: 'demo-wallet-guide',
        title: 'How the Frontend Demo Wallet Works',
        summary: 'Understand simulated entry fee deductions, demo refunds, and winning prize payouts.',
        category: 'Wallet',
        content: `### Simulated Demo Wallet Overview

VONK Tournaments is currently operating in **100% Frontend Demo Mode**. No real payments, UPI, credit cards, or real currency transactions take place.

#### Key Wallet Rules:
- **Starting Balance**: Every player receives a simulated starting balance.
- **Entry Fee Deduction**: When you register for a paid tournament, entry fee is deducted from local storage.
- **Automated Refunds**: If an organizer rejects your registration or cancels a match, funds are credited back instantly.
- **Demo Prizes**: Victory payouts are credited directly to your local wallet ledger.`,
        relatedArticleIds: ['article-1'],
        keywords: ['wallet', 'refund', 'prize', 'entry fee', 'demo'],
        updatedAt: new Date().toISOString(),
        audience: 'ALL',
        isDemo: true
      },
      {
        id: 'article-3',
        slug: 'room-credentials-check-in',
        title: 'Retrieving Room Credentials & Check-In',
        summary: 'Step-by-step instructions for getting Room ID and Password before match launch.',
        category: 'Match Center',
        content: `### Room Credentials & Check-In Protocol

1. Navigate to the Tournament page or click the **Match Credentials** notification.
2. When the organizer releases credentials, the Room ID and Password will display in the Match Center.
3. Copy the credentials and enter the in-game lobby immediately.`,
        relatedArticleIds: ['article-1'],
        keywords: ['room id', 'password', 'check in', 'lobby', 'match center'],
        updatedAt: new Date().toISOString(),
        audience: 'ALL',
        isDemo: true
      }
    ];

    localHelpArticleRepository.saveAll(seedArticles);
    return seedArticles;
  }

  getArticleBySlug(slug: string): HelpArticle | null {
    return localHelpArticleRepository.getBySlug(slug);
  }

  searchHelpArticles(query: string, category?: HelpCategory): HelpArticle[] {
    const list = this.getHelpArticles();
    return list.filter((a) => {
      const matchCat = !category || category === 'Getting Started' || a.category === category;
      const matchQuery =
        !query ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.summary.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()));
      return matchCat && matchQuery;
    });
  }

  // --- SUPPORT TICKETS ---
  getTickets(userId: string): SupportTicket[] {
    return localSupportTicketRepository.getByUserId(userId);
  }

  getTicketById(id: string): SupportTicket | null {
    return localSupportTicketRepository.getById(id);
  }

  createTicket(
    userId: string,
    userName: string,
    role: string,
    subject: string,
    category: SupportTicketCategory,
    priority: SupportTicketPriority,
    description: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ): SupportTicket {
    const ticketId = `ticket-${Date.now()}`;
    const initialMsg: SupportMessage = {
      id: `msg-${Date.now()}-1`,
      ticketId,
      authorType: 'USER',
      authorName: userName || 'Player',
      message: description,
      createdAt: new Date().toISOString(),
      isInternal: false,
      isDemo: true
    };

    const autoReply: SupportMessage = {
      id: `msg-${Date.now()}-2`,
      ticketId,
      authorType: 'SUPPORT_DEMO',
      authorName: 'Demo Support Assistant',
      message: `Hello ${userName}, thank you for contacting VONK Support! We have received your ticket regarding "${subject}". Our simulated support assistant is reviewing your query.`,
      createdAt: new Date(Date.now() + 1000).toISOString(),
      isInternal: false,
      isDemo: true
    };

    const ticket: SupportTicket = {
      id: ticketId,
      userId,
      userName,
      role,
      subject,
      category,
      priority,
      status: 'OPEN',
      description,
      relatedEntityType,
      relatedEntityId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialMsg, autoReply],
      tags: [category.toLowerCase()],
      isDemo: true
    };

    localSupportTicketRepository.save(ticket);
    return ticket;
  }

  addMessage(ticketId: string, authorType: SupportMessage['authorType'], authorName: string, message: string): SupportMessage | null {
    const ticket = localSupportTicketRepository.getById(ticketId);
    if (!ticket) return null;

    const msg: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      authorType,
      authorName,
      message,
      createdAt: new Date().toISOString(),
      isInternal: false,
      isDemo: true
    };

    ticket.messages.push(msg);
    ticket.updatedAt = new Date().toISOString();
    if (authorType === 'USER' && ticket.status === 'WAITING_FOR_USER') {
      ticket.status = 'IN_PROGRESS';
    }
    localSupportTicketRepository.save(ticket);
    return msg;
  }

  updateTicketStatus(ticketId: string, status: SupportTicketStatus): boolean {
    const ticket = localSupportTicketRepository.getById(ticketId);
    if (!ticket) return false;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    if (status === 'RESOLVED') ticket.resolvedAt = new Date().toISOString();
    if (status === 'CLOSED') ticket.closedAt = new Date().toISOString();
    localSupportTicketRepository.save(ticket);
    return true;
  }

  // --- ISSUE REPORTS ---
  createIssueReport(
    userId: string,
    issueType: IssueType,
    title: string,
    description: string,
    severity: IssueSeverity,
    options?: {
      relatedUrl?: string;
      relatedEntity?: string;
      stepsToReproduce?: string;
      expectedResult?: string;
      actualResult?: string;
      deviceInfo?: string;
    }
  ): IssueReport {
    const report: IssueReport = {
      id: `issue-${Date.now()}`,
      userId,
      issueType,
      title,
      description,
      severity,
      relatedUrl: options?.relatedUrl,
      relatedEntity: options?.relatedEntity,
      stepsToReproduce: options?.stepsToReproduce,
      expectedResult: options?.expectedResult,
      actualResult: options?.actualResult,
      deviceInfo: options?.deviceInfo,
      createdAt: new Date().toISOString(),
      isDemo: true
    };
    localIssueReportRepository.save(report);
    return report;
  }

  // --- PLATFORM STATUS ---
  getPlatformStatus(): PlatformSystemStatus {
    const stored = localPlatformStatusRepository.get();
    if (stored) return stored;

    const defaultStatus: PlatformSystemStatus = {
      services: [
        { name: 'Website UI', status: 'OPERATIONAL', latencyMs: 12 },
        { name: 'Local Storage', status: 'OPERATIONAL', latencyMs: 2 },
        { name: 'Tournament Engine', status: 'OPERATIONAL', latencyMs: 18 },
        { name: 'Registration Engine', status: 'OPERATIONAL', latencyMs: 15 },
        { name: 'Match Center', status: 'OPERATIONAL', latencyMs: 24 },
        { name: 'Results & Standings', status: 'OPERATIONAL', latencyMs: 10 },
        { name: 'Demo Wallet', status: 'OPERATIONAL', latencyMs: 5 },
        { name: 'Notifications', status: 'OPERATIONAL', latencyMs: 8 },
        { name: 'Support Center', status: 'OPERATIONAL', latencyMs: 14 }
      ],
      updatedAt: new Date().toISOString()
    };
    localPlatformStatusRepository.save(defaultStatus);
    return defaultStatus;
  }

  seedData(userId: string): void {
    const tickets = localSupportTicketRepository.getByUserId(userId);
    if (tickets.length === 0) {
      this.createTicket(
        userId,
        'Apex Player',
        'Player',
        'Inquiry regarding Season 4 credentials',
        'ROOM_CREDENTIAL_ISSUE',
        'NORMAL',
        'Hello support, when will room credentials for Round 1 be published by the organizer?'
      );
    }
  }
}

export const supportService = new SupportService();
