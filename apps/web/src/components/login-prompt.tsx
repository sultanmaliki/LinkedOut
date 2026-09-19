'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { LogIn, X } from 'lucide-react';

import { cn } from '@/lib/cn';
import { buttonStyles } from './ui/button';

interface LoginPromptContextValue {
  promptLogin: (message?: string) => void;
}

const LoginPromptContext = createContext<LoginPromptContextValue | undefined>(undefined);

const DEFAULT_MESSAGE = "You'll need to log in to do that.";
const AUTO_DISMISS_MS = 6000;

// Mounted separately from AuthProvider: this is a UI concern (an unlogged-in
// visitor tried a restricted action, e.g. liking a post) rather than session
// state, and several unrelated components (like button, comment box, report
// button, ...) need to trigger it without depending on auth internals.
export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  // Toggled a tick after `message` is set so the toast transitions in
  // instead of appearing instantly -- see the mount-time useEffect below.
  const [visible, setVisible] = useState(false);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    // Wait for the exit transition before unmounting the message.
    setTimeout(() => setMessage(null), 200);
  }, []);

  const promptLogin = useCallback((text?: string) => {
    if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    setMessage(text ?? DEFAULT_MESSAGE);
    dismissTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setMessage(null), 200);
    }, AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    if (message === null) return;
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [message]);

  useEffect(
    () => () => {
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    },
    [],
  );

  return (
    <LoginPromptContext.Provider value={{ promptLogin }}>
      {children}
      {message && (
        <div
          role="status"
          className={cn(
            'fixed bottom-6 left-6 z-40 flex max-w-[22rem] items-start gap-3 rounded-xl border border-line-strong bg-surface p-4 shadow-[var(--shadow-lifted)] transition-all duration-200 ease-out print:hidden',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
          )}
        >
          <div className="flex-1">
            <p className="text-[13.5px] font-medium text-fg">{message}</p>
            <Link
              href="/auth"
              onClick={dismiss}
              className={buttonStyles('primary', 'sm', 'mt-2.5')}
            >
              <LogIn className="h-3.5 w-3.5" /> Log in
            </Link>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 text-fg-faint hover:text-fg"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
}

export function useLoginPrompt(): (message?: string) => void {
  const context = useContext(LoginPromptContext);

  if (!context) {
    throw new Error('useLoginPrompt must be used within a LoginPromptProvider');
  }

  return context.promptLogin;
}
