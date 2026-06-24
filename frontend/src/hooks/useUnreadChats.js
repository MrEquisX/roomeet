import { useEffect, useState } from 'react';
import {
  initUnreadChatsListener,
  subscribeUnreadChats,
} from '../services/unreadChatsService';

export function useUnreadChats() {
  const [state, setState] = useState({ hasUnread: false, unreadCount: 0 });

  useEffect(() => {
    initUnreadChatsListener();
    return subscribeUnreadChats(setState);
  }, []);

  return state;
}
