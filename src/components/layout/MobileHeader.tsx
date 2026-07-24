'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { ROUTES } from '@/constants';
import { Bell, Wallet, User } from 'lucide-react';

export const MobileHeader: React.FC = () => {
  const { role, user } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();

  return (
    <header className="flex md:hidden sticky top-0 z-50 w-full border-b-2 border-card-border bg-background-secondary/95 backdrop-blur-md px-4 py-3 items-center justify-between shadow-md">
      <Link href={ROUTES.HOME} className="flex items-center gap-1.5">
        <span className="font-black text-xl tracking-tighter text-gradient">
          VONK
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        {role !== 'Guest' && user ? (
          <>
            {/* Quick Wallet Indicator */}
            <Link
              href={ROUTES.WALLET}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-card-border bg-card-bg/60 text-xs font-mono font-bold text-gradient-prize"
            >
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span>₹{balance}</span>
            </Link>

            {/* Quick Notifications link */}
            <Link
              href={ROUTES.NOTIFICATIONS}
              className="relative p-1.5 rounded-full border border-card-border bg-card-bg/40 text-foreground/80"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-danger text-[9px] font-black text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </>
        ) : (
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted border border-dashed border-card-border px-2 py-0.5 rounded">
            Guest
          </div>
        )}

        {/* Small avatar indicator */}
        <Link
          href={role === 'Guest' ? '#' : ROUTES.PROFILE}
          className="flex items-center justify-center h-8 w-8 rounded-full border border-card-border bg-card-bg/40 overflow-hidden"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-muted" />
          )}
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
