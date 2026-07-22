import { useMemo, useState } from 'react';
import { useNotifications } from '@/providers/NotificationProvider';
import { NotificationCategory } from '@/types';

export const useNotificationFilters = () => {
  const { notifications } = useNotifications();
  const [tab, setTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchTab =
        tab === 'ALL' ||
        (tab === 'UNREAD' && n.status === 'UNREAD') ||
        (tab === 'ARCHIVED' && n.status === 'ARCHIVED') ||
        n.type === (tab as NotificationCategory);
      const matchSearch =
        !search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [notifications, tab, search]);

  return { filtered, tab, setTab, search, setSearch };
};

export default useNotificationFilters;
