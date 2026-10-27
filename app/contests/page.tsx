'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface LeaderboardRow {
  rank: number;
  user_email: string;
  problems_solved: number;
  total_points: number;
  first_ac_at: string;
}

interface ContestProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  time_limit_ms: number;
}

const DIFF_COLOR = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  Hard: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
};

export default function ContestsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [contestProblems, setContestProblems] = useState<ContestProblem[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const contestEnd = new Date('2026-12-31T23:59:59Z');

  const fetchLeaderboard = async () => {
    try {
      // 1. Try fetching from view
      const { data, error } = await supabase
        .from('contest_leaderboard')
        .select('*')
        .order('total_points', { ascending: false });

      if (!error && data && data.length > 0) {
        const rows: LeaderboardRow[] = data.map((item: any, idx: number) => ({
          rank: idx + 1,
          user_email: item.user_email || 'anonymous',
          problems_solved: Number(item.problems_solved) || 0,
          total_points: Number(item.total_points) || 0,
          first_ac_at: item.first_ac_at || new Date().toISOString(),
        }));
        setLeaderboard(rows);
        return;
      }

      // 2. Fallback: Aggregate from submissions table
      const { data: subData, error: subError } = await supabase
        .from('submissions')
        .select('user_email, verdict, created_at, problem_id')
        .eq('verdict', 'AC');

      let allAcSubs: any[] = (!subError && subData) ? [...subData] : [];
      try {
        const raw = window.localStorage.getItem('judgelite_submissions') || '[]';
        const parsed = JSON.parse(raw);
        const localAc = parsed.filter((s: any) => s.verdict === 'AC');
        allAcSubs = [...allAcSubs, ...localAc];
      } catch (e) {}

      if (allAcSubs.length > 0) {
        const userMap: Record<string, { email: string; solved: Set<string>; firstAc: string }> = {};
        allAcSubs.forEach((s: any) => {
          const email = s.username || s.user_email || 'guest';
          if (!userMap[email]) {
            userMap[email] = { email, solved: new Set(), firstAc: s.created_at };
          }
          userMap[email].solved.add(s.problem_id || s.problem_slug);
          if (new Date(s.created_at) < new Date(userMap[email].firstAc)) {
            userMap[email].firstAc = s.created_at;
          }
        });

        const rows: LeaderboardRow[] = Object.values(userMap)
          .map(u => ({
            rank: 0,
            user_email: u.email,
            problems_solved: u.solved.size,
            total_points: u.solved.size * 100,
            first_ac_at: u.firstAc,
          }))
          .sort((a, b) => b.total_points - a.total_points || new Date(a.first_ac_at).getTime() - new Date(b.first_ac_at).getTime())
          .map((row, idx) => ({ ...row, rank: idx + 1 }));

        setLeaderboard(rows);
      }
    } catch (e) {
      console.warn('Leaderboard fetch error:', e);
    }
  };

  const fetchContestProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('id,slug,title,difficulty,points,time_limit_ms')
        .limit(6);
      if (!error && data) {
        setContestProblems(data as ContestProblem[]);
      }
    } catch (e) {
      console.warn('Problems fetch error:', e);
    }
  };

  // Initial load + realtime subscription
  useEffect(() => {
    Promise.all([fetchLeaderboard(), fetchContestProblems()]).finally(() => {
      setLoading(false);
    });

    const channel = supabase
      .channel('realtime-leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: 'verdict=eq.AC' },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = contestEnd.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown('Contest ended');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hrs}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100">
      {/* Contest Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Contest
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">JudgeLite Weekly Kickoff #1</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Solve problems, gain points, and climb the real-time leaderboard before the timer expires!
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-center min-w-[200px]">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Time Remaining</span>
            <span className="font-mono text-2xl font-bold text-blue-400">{countdown || 'Calculating...'}</span>
          </div>
        </div>
      </div>

      {/* Contest Problems Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>⚔️</span> Contest Challenges
          </h2>
          <span className="text-xs text-slate-400">Total {contestProblems.length} Problems</span>
        </div>

        {contestProblems.length === 0 ? (
          <p className="text-slate-400 text-sm">Loading contest challenges...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contestProblems.map((prob, idx) => (
              <Link
                key={prob.id}
                href={`/problems/${prob.slug}`}
                className="group p-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-slate-500 font-bold">Problem #{idx + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${DIFF_COLOR[prob.difficulty]}`}>
                      {prob.difficulty}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors text-base line-clamp-1">
                    {prob.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>Score: <strong className="text-slate-200">{prob.points} pts</strong></span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform">Solve Challenge →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Leaderboard Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🏆</span> Live Leaderboard
          </h2>
          <span className="text-xs text-slate-400">Updates live on every Accepted submission</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-slate-800 text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-center w-16">Rank</th>
                <th className="p-3 text-left">Participant</th>
                <th className="p-3 text-center">Problems Solved</th>
                <th className="p-3 text-center">Total Points</th>
                <th className="p-3 text-left">First AC Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 animate-pulse">
                    Loading standings...
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No leaderboard data yet. Be the first to solve a problem and claim rank #1!
                  </td>
                </tr>
              ) : (
                leaderboard.map((row) => (
                  <tr key={row.rank + row.user_email} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 text-center font-bold">
                      {row.rank === 1 ? '🥇 1' : row.rank === 2 ? '🥈 2' : row.rank === 3 ? '🥉 3' : row.rank}
                    </td>
                    <td className="p-3 font-medium text-slate-200">{row.user_email}</td>
                    <td className="p-3 text-center text-emerald-400 font-semibold">{row.problems_solved}</td>
                    <td className="p-3 text-center text-amber-400 font-bold">{row.total_points}</td>
                    <td className="p-3 text-xs text-slate-400">{new Date(row.first_ac_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

