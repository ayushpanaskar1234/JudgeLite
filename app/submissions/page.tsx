'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type Submission = {
  id: string;
  user_id?: string;
  user_email?: string;
  username?: string;
  problem_id?: string;
  problem_title?: string;
  problem_slug?: string;
  language: string;
  verdict: string;
  passed_count?: number | null;
  total_count?: number | null;
  passed_cases?: number | null;
  execution_time_ms?: number | null;
  source_code?: string;
  created_at: string;
};

const VERDICT_STYLE: Record<string, string> = {
  AC:  'bg-green-600 text-white',
  WA:  'bg-red-600 text-white',
  TLE: 'bg-yellow-500 text-gray-900',
  CE:  'bg-orange-500 text-white',
  RE:  'bg-purple-600 text-white',
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('Coder');
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.email) {
          const userObj = { id: user.id, email: user.email };
          setCurrentUser(userObj);

          const resolvedUsername =
            user?.user_metadata?.username ||
            (typeof window !== 'undefined' ? window.localStorage.getItem('judgelite_username') : null) ||
            user.email.split('@')[0] ||
            'Coder';
          setCurrentUsername(resolvedUsername);

          // 1. Fetch user's own submissions from Supabase DB
          let dbSubs: Submission[] = [];
          try {
            const { data, error } = await supabase
              .from('submissions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (!error && data) {
              dbSubs = data as Submission[];
            }
          } catch (e) {
            console.warn('Supabase fetch error:', e);
          }

          // 2. Read user's own submissions from localStorage (strictly filtered by user email/id/username)
          let localSubs: Submission[] = [];
          try {
            const raw = window.localStorage.getItem('judgelite_submissions') || '[]';
            const parsed: Submission[] = JSON.parse(raw);
            localSubs = parsed.filter(
              s =>
                s.user_email === user.email ||
                s.user_id === user.id ||
                s.username === resolvedUsername ||
                s.user_email === resolvedUsername
            );
          } catch (e) {
            console.warn('localStorage parse error:', e);
          }

          // 3. Merge submissions: localStorage retains rich client metadata (problem title, slug, code, username)
          const map: Record<string, Submission> = {};
          dbSubs.forEach(s => { map[s.id] = s; });
          localSubs.forEach(s => { map[s.id] = { ...map[s.id], ...s }; });

          const merged = Object.values(map).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          setSubmissions(merged);
        } else {
          // Guest user: check if there are guest submissions
          setCurrentUser(null);
          try {
            const raw = window.localStorage.getItem('judgelite_submissions') || '[]';
            const parsed: Submission[] = JSON.parse(raw);
            const guestSubs = parsed.filter(s => !s.user_email || s.user_email === 'guest@judgelite.dev' || s.user_email === 'Coder');
            setSubmissions(guestSubs);
          } catch (e) {
            setSubmissions([]);
          }
        }
      } catch (e) {
        console.error('Error loading submissions:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Clear your local submission history from this browser?')) {
      if (currentUser) {
        try {
          const raw = window.localStorage.getItem('judgelite_submissions') || '[]';
          const parsed: Submission[] = JSON.parse(raw);
          const remaining = parsed.filter(
            s =>
              s.user_email !== currentUser.email &&
              s.user_id !== currentUser.id &&
              s.username !== currentUsername &&
              s.user_email !== currentUsername
          );
          window.localStorage.setItem('judgelite_submissions', JSON.stringify(remaining));
        } catch (e) {}
      } else {
        window.localStorage.removeItem('judgelite_submissions');
      }
      setSubmissions(prev => prev.filter(s => s.user_id && !s.id.match(/^\d{13}$/)));
    }
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100">
        <p className="text-gray-400 animate-pulse">Loading your submissions...</p>
      </main>
    );
  }

  // If not logged in and no guest submissions, prompt user to log in
  if (!currentUser && submissions.length === 0) {
    return (
      <main className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-md w-full shadow-xl">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Recent Submissions</h1>
          <p className="text-slate-400 text-sm mb-6">
            Submissions on JudgeLite are private to each user. Please sign in to view your submission history and code.
          </p>
          <Link
            href="/login"
            className="block w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-center shadow-lg shadow-blue-600/20"
          >
            Sign In to View
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recent Submissions</h1>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser ? `Submissions for ${currentUsername} (${currentUser.email})` : 'Guest session submissions'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearHistory}
            title="Clear cached submissions from this browser"
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 rounded-lg bg-slate-900 transition-colors flex items-center gap-1.5"
          >
            <span>🗑️</span> Clear History
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-5">
        Showing {submissions.length} submission{submissions.length === 1 ? '' : 's'}
      </p>

      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <p className="text-slate-300 text-base font-semibold mb-2">
            No submissions yet
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Solve problems and submit your code to track your progress and review previous attempts!
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            Browse Problems →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-lg">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-800 text-gray-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Problem</th>
                <th className="p-3 text-left">Verdict</th>
                <th className="p-3 text-left">Language</th>
                <th className="p-3 text-left">Runtime</th>
                <th className="p-3 text-left">Test Cases Passed</th>
                <th className="p-3 text-left">Submitted</th>
                <th className="p-3 text-center">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {submissions.map((s, i) => {
                const passedCount = s.passed_count ?? s.passed_cases ?? null;
                const totalCount = s.total_count ?? null;
                const displayUser =
                  s.username ||
                  (typeof window !== 'undefined' ? localStorage.getItem('judgelite_username') : null) ||
                  s.user_email ||
                  'Coder';

                return (
                  <tr key={s.id} className={'transition-colors hover:bg-gray-800 ' + (i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900')}>
                    {/* User */}
                    <td className="p-3 font-medium text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        <span className="truncate max-w-[130px] font-semibold text-slate-200" title={displayUser}>
                          {displayUser}
                        </span>
                      </div>
                    </td>

                    {/* Problem */}
                    <td className="p-3 font-medium">
                      {s.problem_slug ? (
                        <Link href={`/problems/${s.problem_slug}`} className="text-blue-400 hover:text-blue-300">
                          {s.problem_title || s.problem_slug}
                        </Link>
                      ) : (
                        <span className="text-gray-300">{s.problem_title || s.problem_id || '—'}</span>
                      )}
                    </td>

                    {/* Verdict badge */}
                    <td className="p-3">
                      <span className={'px-2 py-0.5 rounded text-xs font-bold ' + (VERDICT_STYLE[s.verdict] || 'bg-gray-600 text-white')}>
                        {s.verdict}
                      </span>
                    </td>

                    {/* Language */}
                    <td className="p-3 text-gray-300 font-mono text-xs">{s.language}</td>

                    {/* Runtime */}
                    <td className="p-3 text-gray-300 font-mono text-xs">
                      {s.execution_time_ms != null ? `${s.execution_time_ms} ms` : '—'}
                    </td>

                    {/* Passed count */}
                    <td className="p-3 text-gray-300 font-mono text-xs">
                      {passedCount != null && totalCount != null
                        ? `${passedCount} / ${totalCount}`
                        : passedCount != null
                        ? String(passedCount)
                        : '—'}
                    </td>

                    {/* Submitted Date */}
                    <td className="p-3 text-gray-400 whitespace-nowrap text-xs">
                      {new Date(s.created_at).toLocaleString()}
                    </td>

                    {/* Code inspection button */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedSub(s)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-100 text-xs rounded border border-slate-700 font-mono transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Code Modal */}
      {selectedSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedSub(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${VERDICT_STYLE[selectedSub.verdict] || 'bg-slate-700 text-white'}`}>
                  {selectedSub.verdict}
                </span>
                <h2 className="font-semibold text-slate-100 text-base">
                  {selectedSub.problem_title || selectedSub.problem_slug || 'Submission Details'}
                </h2>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase font-mono">
                  {selectedSub.language}
                </span>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-400 hover:text-white text-xl p-1 leading-none rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Meta Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/90 text-xs text-slate-400 border-b border-slate-800 font-mono">
              <div className="flex items-center flex-wrap gap-y-1">
                <span>User: </span>
                <span className="text-slate-200 font-semibold ml-1 mr-2">
                  {selectedSub.username || (typeof window !== 'undefined' ? localStorage.getItem('judgelite_username') : null) || selectedSub.user_email || 'Coder'}
                </span>
                <span className="mx-2">•</span>
                <span>Runtime: </span>
                <span className="text-slate-200 ml-1">{selectedSub.execution_time_ms != null ? `${selectedSub.execution_time_ms} ms` : '—'}</span>
                <span className="mx-2">•</span>
                <span>Passed: </span>
                <span className="text-slate-200 ml-1">
                  {selectedSub.passed_count != null && selectedSub.total_count != null
                    ? `${selectedSub.passed_count}/${selectedSub.total_count}`
                    : selectedSub.passed_cases != null
                    ? `${selectedSub.passed_cases}`
                    : '—'}
                </span>
                <span className="mx-2">•</span>
                <span>Date: </span>
                <span className="text-slate-200 ml-1">{new Date(selectedSub.created_at).toLocaleString()}</span>
              </div>
              <button
                onClick={() => {
                  if (selectedSub.source_code) {
                    navigator.clipboard.writeText(selectedSub.source_code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                disabled={!selectedSub.source_code}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-xs font-sans transition-colors flex items-center gap-1 shrink-0"
              >
                {copied ? '✓ Copied!' : '📋 Copy Code'}
              </button>
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-auto flex-1 bg-slate-950 font-mono text-xs text-emerald-300">
              {selectedSub.source_code ? (
                <pre className="whitespace-pre overflow-x-auto leading-relaxed">
                  <code>{selectedSub.source_code}</code>
                </pre>
              ) : (
                <div className="py-12 text-center text-slate-500 font-sans text-sm">
                  No source code was recorded for this submission.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-950">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
