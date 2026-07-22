'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { supportService } from '@/lib/services/support-service';
import { useAuth } from './AuthProvider';

interface SupportContextType {
  tickets: SupportTicket[];
  helpArticles: HelpArticle[];
  platformStatus: PlatformSystemStatus;
  createTicket: (subject: string, category: SupportTicketCategory, priority: SupportTicketPriority, description: string, relatedEntityType?: string, relatedEntityId?: string) => SupportTicket;
  addReply: (ticketId: string, message: string) => SupportMessage | null;
  updateStatus: (ticketId: string, status: SupportTicketStatus) => boolean;
  searchHelp: (query: string, category?: HelpCategory) => HelpArticle[];
  getArticle: (slug: string) => HelpArticle | null;
  createIssueReport: (issueType: IssueType, title: string, description: string, severity: IssueSeverity, options?: any) => IssueReport;
  refreshData: () => void;
}

const SupportContext = createContext<SupportContextType | null>(null);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'player-user';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [platformStatus, setPlatformStatus] = useState<PlatformSystemStatus>(() => supportService.getPlatformStatus());

  const refreshData = useCallback(() => {
    setTickets(supportService.getTickets(userId));
    setHelpArticles(supportService.getHelpArticles());
    setPlatformStatus(supportService.getPlatformStatus());
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      supportService.seedData(userId);
      refreshData();
    }, 0);
    return () => clearTimeout(timer);
  }, [userId, refreshData]);

  const createTicket = (subject: string, category: SupportTicketCategory, priority: SupportTicketPriority, description: string, relatedEntityType?: string, relatedEntityId?: string) => {
    const ticket = supportService.createTicket(userId, user?.username || 'Apex Player', user ? 'Player' : 'Guest', subject, category, priority, description, relatedEntityType, relatedEntityId);
    refreshData();
    return ticket;
  };

  const addReply = (ticketId: string, message: string) => {
    const msg = supportService.addMessage(ticketId, 'USER', user?.username || 'Player', message);
    refreshData();
    return msg;
  };

  const updateStatus = (ticketId: string, status: SupportTicketStatus) => {
    const res = supportService.updateTicketStatus(ticketId, status);
    refreshData();
    return res;
  };

  const searchHelp = (query: string, category?: HelpCategory) => {
    return supportService.searchHelpArticles(query, category);
  };

  const getArticle = (slug: string) => {
    return supportService.getArticleBySlug(slug);
  };

  const createIssueReport = (issueType: IssueType, title: string, description: string, severity: IssueSeverity, options?: any) => {
    const rep = supportService.createIssueReport(userId, issueType, title, description, severity, options);
    refreshData();
    return rep;
  };

  return (
    <SupportContext.Provider
      value={{
        tickets,
        helpArticles,
        platformStatus,
        createTicket,
        addReply,
        updateStatus,
        searchHelp,
        getArticle,
        createIssueReport,
        refreshData
      }}
    >
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const ctx = useContext(SupportContext);
  if (!ctx) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return ctx;
};
