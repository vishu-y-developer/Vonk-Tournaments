'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Dispute, DisputeStatus } from '@/types';
import { browserStorage } from '@/lib/storage/browser-storage';
import { STORAGE_KEYS } from '@/constants';
import { useAuth } from './AuthProvider';
import { notificationService } from '@/lib/services/notification-service';

interface DisputeContextType {
  disputes: Dispute[];
  submitDispute: (data: Omit<Dispute, 'id' | 'playerId' | 'playerName' | 'status' | 'createdAt' | 'updatedAt'>) => Dispute | null;
  updateDisputeStatus: (id: string, status: DisputeStatus, response?: string) => void;
  refreshDisputes: () => void;
}

const DisputeContext = createContext<DisputeContextType | undefined>(undefined);

export const DisputeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const { user, isLoaded } = useAuth();

  const refreshDisputes = useCallback(() => {
    setDisputes(browserStorage.getItem<Dispute[]>(STORAGE_KEYS.DISPUTES, []));
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        refreshDisputes();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, refreshDisputes]);

  const submitDispute = (data: Omit<Dispute, 'id' | 'playerId' | 'playerName' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const newDispute: Dispute = {
      ...data,
      id: `disp-${Date.now()}`,
      playerId: user.id,
      playerName: user.inGameName,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = browserStorage.getItem<Dispute[]>(STORAGE_KEYS.DISPUTES, []);
    list.unshift(newDispute);
    browserStorage.setItem(STORAGE_KEYS.DISPUTES, list);
    refreshDisputes();

    return newDispute;
  };

  const updateDisputeStatus = (id: string, status: DisputeStatus, response?: string) => {
    const list = browserStorage.getItem<Dispute[]>(STORAGE_KEYS.DISPUTES, []);
    const index = list.findIndex((d) => d.id === id);

    if (index > -1) {
      const dispute = list[index];
      dispute.status = status;
      if (response !== undefined) {
        dispute.organizerResponse = response;
      }
      dispute.updatedAt = new Date().toISOString();

      browserStorage.setItem(STORAGE_KEYS.DISPUTES, list);
      refreshDisputes();

      // Notify the player raising the dispute
      notificationService.sendNotification(
        dispute.playerId,
        'DISPUTE_UPDATED',
        'Dispute Ticket Updated',
        `Your dispute ticket for "${dispute.tournamentTitle}" has been updated to "${status}".`
      );
    }
  };

  return (
    <DisputeContext.Provider
      value={{
        disputes,
        submitDispute,
        updateDisputeStatus,
        refreshDisputes,
      }}
    >
      {children}
    </DisputeContext.Provider>
  );
};

export const useDisputes = () => {
  const context = useContext(DisputeContext);
  if (context === undefined) {
    throw new Error('useDisputes must be used within a DisputeProvider');
  }
  return context;
};
