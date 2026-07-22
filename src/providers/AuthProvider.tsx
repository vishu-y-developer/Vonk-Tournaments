'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, UserRole } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { browserStorage } from '@/lib/storage/browser-storage';
import { runMigrations } from '@/lib/storage/migrations';

interface AuthContextType {
  role: UserRole;
  user: Player | null;
  setRole: (role: UserRole) => void;
  updateProfile: (updatedUser: Partial<Player>) => void;
  resetAllData: () => void;
  seedAllData: () => void;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('Player');
  const [user, setUser] = useState<Player | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Run migrations and seed data on initial mount (hydration safe)
    runMigrations();

    const storedRole = browserStorage.getItem<UserRole>(STORAGE_KEYS.ROLE, 'Player');
    const storedUser = browserStorage.getItem<Player | null>(STORAGE_KEYS.USER, null);

    const timer = setTimeout(() => {
      setRoleState(storedRole);
      setUser(storedUser);
      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    browserStorage.setItem(STORAGE_KEYS.ROLE, newRole);
  };

  const updateProfile = (updatedFields: Partial<Player>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    browserStorage.setItem(STORAGE_KEYS.USER, updatedUser);
  };

  const resetAllData = () => {
    browserStorage.clear();
    setRoleState('Player');
    setUser(null);
    window.location.reload();
  };

  const seedAllData = () => {
    browserStorage.clear();
    runMigrations();
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        setRole,
        updateProfile,
        resetAllData,
        seedAllData,
        isLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
