'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const resolveUsername = (user: any): string => {
    if (user?.user_metadata?.username) {
      return String(user.user_metadata.username).trim();
    }
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('judgelite_username');
      if (local && local.trim()) return local.trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Coder';
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user ?? null);
      if (user) {
        setUsername(resolveUsername(user));
      } else {
        setUsername(null);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        setUsername(resolveUsername(user));
      } else {
        setUsername(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSaveUsername = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempUsername.trim();
    if (!trimmed) return;

    setIsSavingUsername(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { username: trimmed },
      });
      if (error) throw error;

      // Persist in localStorage
      localStorage.setItem('judgelite_username', trimmed);

      // Update existing records in localStorage submissions
      try {
        const rawSubs = localStorage.getItem('judgelite_submissions');
        if (rawSubs) {
          const subs = JSON.parse(rawSubs);
          if (Array.isArray(subs)) {
            const updated = subs.map((s: any) => {
              if (
                (currentUser?.email && s.user_email === currentUser.email) ||
                (currentUser?.id && s.user_id === currentUser.id) ||
                (username && s.username === username) ||
                (username && s.user_email === username)
              ) {
                return {
                  ...s,
                  user_email: trimmed,
                  username: trimmed,
                };
              }
              return s;
            });
            localStorage.setItem('judgelite_submissions', JSON.stringify(updated));
          }
        }
      } catch (err) {
        console.error('Failed to update local submissions cache:', err);
      }

      setUsername(trimmed);
      if (data?.user) {
        setCurrentUser(data.user);
      }
      setIsEditingUsername(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update username');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUsername(null);
    router.push('/login');
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={
          'text-sm font-medium transition-colors px-1 pb-0.5 border-b-2 ' +
          (active
            ? 'text-white border-blue-400'
            : 'text-slate-400 border-transparent hover:text-white hover:border-slate-500')
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-6 py-3 flex items-center justify-between shadow-md">
      {/* Logo + desktop links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          Judge<span className="text-blue-400">Lite</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLink('/problems', 'Problems')}
          {navLink('/contests', 'Contests')}
          {navLink('/submissions', 'Submissions')}
          {navLink('/profile', 'Profile')}
        </div>
      </div>

      {/* Auth & External Links area */}
      <div className="hidden md:flex items-center gap-3">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Star on GitHub"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span>GitHub</span>
        </a>

        {currentUser ? (
          <div className="flex items-center gap-2">
            {/* Inline Username Display / Editor */}
            {isEditingUsername ? (
              <form onSubmit={handleSaveUsername} className="flex items-center gap-1.5 bg-slate-800 border border-blue-500/80 px-2 py-1 rounded-lg shadow-lg">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="New username"
                  autoFocus
                  maxLength={24}
                  className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-28 font-medium"
                />
                <button
                  type="submit"
                  disabled={isSavingUsername || !tempUsername.trim()}
                  className="text-xs px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 transition"
                  title="Save Username"
                >
                  {isSavingUsername ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingUsername(false)}
                  className="text-xs px-1 text-slate-400 hover:text-slate-200"
                  title="Cancel"
                >
                  ✕
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
                <span
                  className="text-xs font-semibold text-slate-200 max-w-[140px] truncate"
                  title={`Username: ${username} (${currentUser.email})`}
                >
                  {username}
                </span>
                <button
                  onClick={() => {
                    setTempUsername(username || '');
                    setIsEditingUsername(true);
                  }}
                  className="text-xs text-slate-400 hover:text-blue-400 hover:scale-110 transition-transform p-0.5"
                  title="Change Username"
                  aria-label="Change Username"
                >
                  ✏️
                </button>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium text-slate-200 hover:text-white"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-sm px-4 py-1.5 rounded-lg transition-colors font-medium shadow-md shadow-blue-600/20"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-slate-300 hover:text-white"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col gap-4 md:hidden z-50 shadow-xl">
          <Link href="/problems" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Problems</Link>
          <Link href="/contests" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Contests</Link>
          <Link href="/submissions" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Submissions</Link>
          <Link href="/profile" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white font-medium">Profile</Link>

          {currentUser ? (
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">{username}</span>
                  <span className="text-[11px] text-slate-500">({currentUser.email})</span>
                </div>
                <button
                  onClick={() => {
                    const promptVal = window.prompt('Enter new username:', username || '');
                    if (promptVal && promptVal.trim()) {
                      setTempUsername(promptVal.trim());
                      handleSaveUsername();
                    }
                  }}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  ✏️ Edit
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="text-left text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="text-blue-400 hover:text-blue-300 font-medium pt-2 border-t border-slate-800"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
