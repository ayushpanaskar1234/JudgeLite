'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  time_limit_ms: number;
};

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
const DIFF_COLOR = {
  Easy: 'bg-green-600/20 text-green-400 border border-green-600/40',
  Medium: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/40',
  Hard: 'bg-red-600/20 text-red-400 border border-red-600/40',
};

export default function ProblemsClient({ problems }: { problems: Problem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  // Read solved problem IDs from both localStorage and Supabase DB
  useEffect(() => {
    (async () => {
      const acSet = new Set<string>();

      // 1. Read from localStorage
      try {
        const subs = JSON.parse(localStorage.getItem('judgelite_submissions') || '[]');
        subs
          .filter((s: any) => s.verdict === 'AC')
          .forEach((s: any) => {
            if (s.problem_id) acSet.add(s.problem_id);
          });
      } catch (e) {}

      // 2. Fetch authenticated user's AC submissions from Supabase DB
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('submissions')
            .select('problem_id')
            .eq('user_id', user.id)
            .eq('verdict', 'AC');

          if (!error && data) {
            data.forEach((row: any) => {
              if (row.problem_id) acSet.add(row.problem_id);
            });
          }
        }
      } catch (e) {}

      setSolvedIds(acSet);
    })();
  }, []);

  const handlePickRandom = () => {
    if (problems.length === 0) return;
    const randomProblem = problems[Math.floor(Math.random() * problems.length)];
    router.push(`/problems/${randomProblem.slug}`);
  };

  const filtered = problems
    .filter(p => diffFilter === 'All' || p.difficulty === diffFilter)
    .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

  const counts = {
    All: problems.length,
    Easy: problems.filter(p => p.difficulty === 'Easy').length,
    Medium: problems.filter(p => p.difficulty === 'Medium').length,
    Hard: problems.filter(p => p.difficulty === 'Hard').length,
  };

  const solvedCount = problems.filter(p => solvedIds.has(p.id)).length;
  const progressPercent = problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Problems</h1>
          <p className="text-xs text-slate-400 mt-1">Practice and master algorithmic challenges</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handlePickRandom}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-sm font-medium transition shadow-sm hover:border-indigo-500/50"
            title="Pick a random problem to solve"
          >
            <span>🎲</span> Pick Random
          </button>
          {/* Search */}
          <input
            type="text"
            placeholder="🔍  Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Solved Progress Bar */}
      <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{solvedCount} of {problems.length} Solved</span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {progressPercent}% Complete
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Keep practicing to master all algorithm categories</p>
          </div>
        </div>
        <div className="flex-1 max-w-sm w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Difficulty tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['All', 'Easy', 'Medium', 'Hard'] as const).map(d => (
          <button
            key={d}
            onClick={() => setDiffFilter(d)}
            className={
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ' +
              (diffFilter === d
                ? d === 'Easy'
                  ? 'bg-green-600 border-green-500 text-white'
                  : d === 'Medium'
                  ? 'bg-yellow-600 border-yellow-500 text-white'
                  : d === 'Hard'
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-blue-600 border-blue-500 text-white'
                : 'bg-transparent border-slate-700 text-slate-400 hover:text-white hover:border-slate-500')
            }
          >
            {d} <span className="opacity-70 text-xs">({counts[d]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-lg">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left w-8">✓</th>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Difficulty</th>
              <th className="px-4 py-3 text-left">Points</th>
              <th className="px-4 py-3 text-left">Time Limit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No problems match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => {
                const solved = solvedIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    className={
                      'transition-colors hover:bg-slate-800/60 ' +
                      (i % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40')
                    }
                  >
                    <td className="px-4 py-3">
                      {solved && (
                        <span className="text-green-400 font-bold text-base" title="Solved">✓</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={'/problems/' + p.slug}
                        className={
                          'hover:underline transition-colors ' +
                          (solved ? 'text-green-400 hover:text-green-300' : 'text-blue-400 hover:text-blue-300')
                        }
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'px-2.5 py-0.5 rounded-full text-xs font-semibold ' + DIFF_COLOR[p.difficulty]}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.points}</td>
                    <td className="px-4 py-3 text-slate-400">{p.time_limit_ms} ms</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-600 mt-3 text-right">
        {filtered.length} of {problems.length} problems
      </p>
    </div>
  );
}
