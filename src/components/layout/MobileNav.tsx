'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants';
import { Home, Gamepad2, Trophy, Wallet, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = [
    { label: 'Home', path: ROUTES.HOME, icon: Home },
    { label: 'Tournaments', path: ROUTES.TOURNAMENTS, icon: Gamepad2 },
    {
      label: 'My Matches',
      path: ROUTES.MY_TOURNAMENTS,
      icon: Trophy,
      disabled: role === 'Guest',
    },
    {
      label: 'Wallet',
      path: ROUTES.WALLET,
      icon: Wallet,
      disabled: role === 'Guest',
    },
    {
      label: 'Profile',
      path: ROUTES.PROFILE,
      icon: User,
      disabled: role === 'Guest',
    },
  ];

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-card-border bg-background/90 backdrop-blur-md pb-safe py-2 px-3 items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        
        if (item.disabled) {
          return (
            <button
              key={item.label}
              onClick={() => {
                alert('Guest access restricted. Switch to Player role using the Role Switcher at the bottom-right.');
              }}
              className="flex flex-col items-center gap-1 text-muted/40 cursor-not-allowed touch-target"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center gap-1 transition-all touch-target ${
              isActive ? 'text-primary scale-105' : 'text-foreground/60 hover:text-primary'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
