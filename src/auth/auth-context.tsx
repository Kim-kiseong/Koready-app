import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createAuthSessionManager } from './auth-runtime';
import type { AuthSession } from './auth-types';

type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  errorMessage: string | null;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const manager = createAuthSessionManager();

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Authentication failed.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    manager
      .restore()
      .then((restored: AuthSession | null) => {
        if (!active) return;
        setSession(restored);
        setStatus(restored ? 'signedIn' : 'signedOut');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(getErrorMessage(error));
        setStatus('signedOut');
      });
    return () => {
      active = false;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setErrorMessage(null);
    try {
      const nextSession = await manager.signInWithGoogle();
      setSession(nextSession);
      setStatus('signedIn');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('signedOut');
    }
  }, []);

  const signOut = useCallback(async () => {
    setErrorMessage(null);
    try {
      await manager.signOut();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSession(null);
      setStatus('signedOut');
    }
  }, []);

  const value = useMemo(
    () => ({ status, session, errorMessage, signInWithGoogle, signOut }),
    [errorMessage, session, signInWithGoogle, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
