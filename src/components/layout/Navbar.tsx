'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { useNotifications } from '@/providers/NotificationProvider';
import { ROUTES } from '@/constants';
import { Wallet, Bell, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();

  const getLinks = () => {
    switch (role) {
      case 'Guest':
        return [
          { label: 'Explore', path: ROUTES.TOURNAMENTS },
          { label: 'Rankings', path: ROUTES.LEADERBOARD },
          { label: 'Rules & Fair Play', path: ROUTES.RULES },
        ];
      case 'Player':
        return [
          { label: 'Explore', path: ROUTES.TOURNAMENTS },
          { label: 'My Tournaments', path: ROUTES.MY_TOURNAMENTS },
          { label: 'My Team', path: ROUTES.TEAMS },
          { label: 'Wallet', path: ROUTES.WALLET },
          { label: 'Rankings', path: ROUTES.LEADERBOARD },
          { label: 'Rules', path: ROUTES.RULES },
          { label: 'Disputes', path: ROUTES.SUPPORT },
        ];
      case 'Organizer':
        return [
          { label: 'Dashboard', path: ROUTES.ORGANIZER },
          { label: 'My Tournaments', path: ROUTES.ORGANIZER_TOURNAMENTS },
          { label: 'Support & Tickets', path: ROUTES.SUPPORT },
          { label: 'Platform Rules', path: ROUTES.RULES },
        ];
      case 'Admin':
        return [
          { label: 'Admin Panel', path: ROUTES.ADMIN },
          { label: 'Tournaments', path: ROUTES.TOURNAMENTS },
          { label: 'Fair Play', path: ROUTES.RULES },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <header className="hidden md:flex sticky top-0 z-50 w-full border-b border-card-border bg-background-secondary/95 backdrop-blur-md px-6 py-4 items-center justify-between shadow-md">
      {/* Brand logo */}
      <Link href={ROUTES.HOME} className="flex items-center gap-2">
        <span className="font-extrabold text-2xl tracking-tighter text-gradient">
          VONK
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted border-l-2 border-card-border pl-2 font-black hidden lg:inline">
          Tournaments
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-bold tracking-wide transition-all uppercase ${
                isActive
                  ? 'text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {role !== 'Guest' && user && (
          <>
            {/* Wallet Quick Balance */}
            <Link
              href={ROUTES.WALLET}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-card-border bg-card-bg/60 hover:bg-card-bg hover:border-primary/30 transition-all group"
            >
              <Wallet className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-mono font-bold text-gradient-prize">
                ₹{balance.toLocaleString()}
              </span>
            </Link>

            {/* Notification Bell */}
            <Link
              href={ROUTES.NOTIFICATIONS}
              className="relative p-2 rounded-full border border-card-border bg-card-bg/40 hover:bg-card-bg transition-all"
            >
              <Bell className="h-4 w-4 text-foreground/85" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-danger text-[9px] font-extrabold text-white shadow-sm">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* User profile / Guest Indicator */}
        {role === 'Guest' ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-card-border text-xs text-muted font-semibold">
            <User className="h-3.5 w-3.5" />
            Guest View
          </div>
        ) : (
          <Link
            href={ROUTES.PROFILE}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-card-border bg-card-bg/40 hover:bg-card-bg transition-all text-xs font-semibold"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.inGameName}
                className="h-5 w-5 rounded-full object-cover border border-primary/45"
              />
            ) : (
              <User className="h-4 w-4 text-muted" />
            )}
            <span className="max-w-[100px] truncate text-foreground/90">
              {user?.inGameName || 'Set Profile'}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
