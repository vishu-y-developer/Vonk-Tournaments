'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Link from 'next/link';
import { NotificationItem } from '@/types';
import { useNotifications } from '@/providers/NotificationProvider';
import { 
  Trophy, 
  Layers, 
  Sword, 
  CheckSquare, 
  Shield, 
  Wallet, 
  Gift, 
  Megaphone, 
  LifeBuoy, 
  Activity, 
  Check, 
  Archive, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';

const renderNotificationIcon = (type: string) => {
  const iconProps = { className: 'h-4 w-4 shrink-0' };
  switch (type) {
    case 'TOURNAMENT':
      return <Trophy {...iconProps} />;
    case 'REGISTRATION':
      return <Layers {...iconProps} />;
    case 'MATCH':
      return <Sword {...iconProps} />;
    case 'RESULT':
    case 'LEADERBOARD':
      return <CheckSquare {...iconProps} />;
    case 'TEAM':
      return <Shield {...iconProps} />;
    case 'WALLET':
      return <Wallet {...iconProps} />;
    case 'PRIZE':
      return <Gift {...iconProps} />;
    case 'ANNOUNCEMENT':
    case 'ORGANIZER':
    case 'ADMIN':
      return <Megaphone {...iconProps} />;
    case 'SUPPORT':
      return <LifeBuoy {...iconProps} />;
    default:
      return <Activity {...iconProps} />;
  }
};

export const NotificationCard: React.FC<{ notification: NotificationItem }> = ({ notification }) => {
  const { markAsRead, markAsUnread, archiveNotification, deleteNotification } = useNotifications();
  const isUnread = notification.status === 'UNREAD';

  return (
    <div 
      className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
        isUnread 
          ? 'border-secondary/40 bg-secondary/5 font-semibold shadow-sm' 
          : 'border-card-border bg-card-bg/20 text-muted'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${isUnread ? 'bg-secondary/15 border-secondary/30 text-secondary' : 'bg-card-bg border-card-border text-muted'}`}>
            {renderNotificationIcon(notification.type)}
          </div>
          <div>
            <span className={`text-xs block ${isUnread ? 'font-black text-foreground' : 'font-bold text-foreground/80'}`}>
              {notification.title}
            </span>
            <span className="text-[10px] text-muted font-mono">
              {new Date(notification.createdAt).toLocaleString()} | Category: {notification.type}
            </span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
          notification.priority === 'URGENT' 
            ? 'bg-danger/20 text-danger border border-danger/30' 
            : notification.priority === 'HIGH'
              ? 'bg-warning/20 text-warning border border-warning/30'
              : 'bg-muted/20 text-muted'
        }`}>
          {notification.priority}
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed pl-1">
        {notification.message}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-card-border/50 text-[10px]">
        <div>
          {notification.actionHref && (
            <Link
              href={notification.actionHref}
              onClick={() => markAsRead(notification.id)}
              className="flex items-center gap-1 font-extrabold text-secondary hover:underline"
            >
              {notification.actionLabel || 'View Details'}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="flex gap-2 text-muted">
          {isUnread ? (
            <button onClick={() => markAsRead(notification.id)} className="hover:text-foreground font-semibold flex items-center gap-1">
              <Check className="h-3 w-3" /> Read
            </button>
          ) : (
            <button onClick={() => markAsUnread(notification.id)} className="hover:text-foreground font-semibold">
              Unread
            </button>
          )}
          <button onClick={() => archiveNotification(notification.id)} className="hover:text-foreground flex items-center gap-1">
            <Archive className="h-3 w-3" /> Archive
          </button>
          <button onClick={() => deleteNotification(notification.id)} className="hover:text-danger flex items-center gap-1">
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
