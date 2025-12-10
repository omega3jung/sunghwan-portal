import { SessionContextValue, useSession } from 'next-auth/react';
import { useMemo } from 'react';
import useSessionStore, {
  SessionAction,
  SessionState
} from '@/lib/sessionStore';
import { CurrentSessionUser } from '@/types/user';

export type CurrentSession = Omit<SessionContextValue, 'data' | 'update'> &
  Omit<SessionAction, 'update'> & {
    data: {
      expires: string;
      user?: CurrentSessionUser;
      legacyClient: string;
      isPOSSelected: boolean;
      isAdminSelected: boolean;
    };
    updateSession: (
      data: Partial<SessionState>,
      force?: boolean
    ) => Promise<void>;
  };

export const useCurrentSession = (): CurrentSession => {
  const { data, ...session } = useSession();
  const store = useSessionStore();

  const sessionData = useMemo(() => {
    if (!data?.user) {
      return {
        expires: '',
        legacyClient: '',
        isPOSSelected: false,
        isAdminSelected: false
      } as CurrentSession['data'];
    }

    const current = data.user;

    return {
      expires: data.expires,
      user: {
        ...current,
        userId: store.userId,
      }
    } as CurrentSession['data'];
  }, [data, store]);

  const update = async (state: Partial<SessionState>, force = false) => {
    if (force) {
      await session.update();
    }
    store.update(state);
  };

  return {
    ...session,
    data: sessionData,
    updateSession: update,
    clear: store.clear,
    initialize: store.initialize
  };
};
