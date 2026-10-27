'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface Submission {
  id: string;
  user_id?: string;
  user_email?: string;
  problem_id?: string;
  problem_title?: string;
  problem_slug?: string;
  language: string;
  verdict: string;
  execution_time_ms?: number | null;
  created_at: string;
}

const VERDICT_STYLE: Record<string, string> = {
  AC: 'bg-emerald-600 text-white',
  WA: 'bg-rose-600 text-white',
  TLE: 'bg-amber-500 text-gray-900',
  CE: 'bg-orange-500 text-white',
  RE: 'bg-purple-600 text-white',
};

// Topic mapping helper
const TOPICS = [
  {
    name: 'Arrays & Hashing',
    keywords: ['sum', 'array', 'duplicate', 'hash', 'freq', 'contain', 'anagram', 'prefix'],
    icon: '📦',
  },
  {
    name: 'Two Pointers & Window',
    keywords: ['two', 'pointer', 'window', 'palindrome', 'container', 'sort', 'target'],
    icon: '👉',
  },
  {
    name: 'Stacks & Queues',
    keywords: ['stack', 'parenthes', 'bracket', 'queue', 'valid'],
    icon: '📚',
  },
  {
    name: 'Dynamic Programming',
    keywords: ['subarray', 'dp', 'jump', 'climb', 'coin', 'fib', 'subsequence', 'max'],
    icon: '📈',
  },
  {
    name: 'Binary Search & Logic',
    keywords: ['search', 'binary', 'bisect', 'median', 'kth', 'guess'],
    icon: '🔍',
  },
];

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredDate, setHoveredDate] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 1. Fetch current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let email = '';
        if (user && user.email) {
          setCurrentUser({ id: user.id, email: user.email });
          email = user.email;
        }

        // 2. Fetch all problems
        const { data: probData, error: probError } = await supabase
          .from('problems')
          .select('id, slug, title, difficulty, points');

        if (!probError && probData) {
          setProblems(probData as Problem[]);
        }

        // 3. Fetch submissions from Supabase DB
        let dbSubs: Submission[] = [];
        if (user) {
          try {
            const { data: subData, error: subError } = await supabase
              .from('submissions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (!subError && subData) {
              dbSubs = subData as Submission[];
            }
          } catch (e) {
            console.warn('Supabase submissions fetch error:', e);
          }
        }

        // 4. Read submissions from localStorage
        let localSubs: Submission[] = [];
        try {
          const raw = window.localStorage.getItem('judgelite_submissions') || '[]';
          const parsed: Submission[] = JSON.parse(raw);
          const currentUsername =
            user?.user_metadata?.username ||
            (typeof window !== 'undefined' ? window.localStorage.getItem('judgelite_username') : null);

          localSubs = parsed.filter(
            (s: any) =>
              (email && s.user_email === email) ||
              (user && s.user_id === user.id) ||
              (currentUsername && (s.username === currentUsername || s.user_email === currentUsername)) ||
              (!email && (!s.user_email || s.user_email === 'guest@judgelite.dev' || s.user_email === 'Coder'))
          );
        } catch (e) {
          console.warn('localStorage parse error:', e);
        }

        // 5. Merge submissions by ID
        const subMap: Record<string, Submission> = {};
        dbSubs.forEach((s) => {
          subMap[s.id] = s;
        });
        localSubs.forEach((s) => {
          subMap[s.id] = { ...subMap[s.id], ...s };
        });

        const mergedSubs = Object.values(subMap).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setSubmissions(mergedSubs);
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Compute profile analytics
  const analytics = useMemo(() => {
    const solvedSet = new Set<string>();
    let totalPoints = 0;
    let fastestRuntime = Infinity;
    let acCount = 0;

    const activityMap: Record<string, number> = {};

    submissions.forEach((s) => {
      // Activity count by date (YYYY-MM-DD)
      const d = new Date(s.created_at);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }

      if (s.verdict === 'AC') {
        acCount++;
        if (s.problem_id) {
          solvedSet.add(s.problem_id);
        }
        if (s.execution_time_ms && s.execution_time_ms > 0) {
          if (s.execution_time_ms < fastestRuntime) {
            fastestRuntime = s.execution_time_ms;
          }
        }
      }
    });

    // Match solved problems
    const solvedProblems = problems.filter((p) => solvedSet.has(p.id));
    solvedProblems.forEach((p) => {
      totalPoints += p.points || 100;
    });

    const easyTotal = problems.filter((p) => p.difficulty === 'Easy').length;
    const mediumTotal = problems.filter((p) => p.difficulty === 'Medium').length;
    const hardTotal = problems.filter((p) => p.difficulty === 'Hard').length;

    const easySolved = solvedProblems.filter((p) => p.difficulty === 'Easy').length;
    const mediumSolved = solvedProblems.filter((p) => p.difficulty === 'Medium').length;
    const hardSolved = solvedProblems.filter((p) => p.difficulty === 'Hard').length;

    const totalSolved = solvedProblems.length;
    const totalSubmissions = submissions.length;
    const acceptanceRate =
      totalSubmissions > 0 ? ((acCount / totalSubmissions) * 100).toFixed(1) : '0.0';

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (activityMap[dateStr] && activityMap[dateStr] > 0) {
        currentStreak++;
      } else {
        // If today has 0 submissions, check if yesterday had submissions before breaking
        if (i === 0) continue;
        break;
      }
    }

    // Rank title
    let rankTitle = '🌱 Coder';
    let rankBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
    if (totalSolved >= 25) {
      rankTitle = '🏆 Grandmaster';
      rankBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    } else if (totalSolved >= 15) {
      rankTitle = '👑 Master';
      rankBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else if (totalSolved >= 8) {
      rankTitle = '⚡ Specialist';
      rankBadgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    } else if (totalSolved >= 3) {
      rankTitle = '🌟 Knight';
      rankBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }

    // Topic mastery analysis
    const topicBreakdown = TOPICS.map((topic) => {
      const topicProblems = problems.filter((p) => {
        const text = `${p.title} ${p.slug}`.toLowerCase();
        return topic.keywords.some((k) => text.includes(k));
      });
      const solvedInTopic = topicProblems.filter((p) => solvedSet.has(p.id)).length;
      const totalInTopic = topicProblems.length || 1;
      const pct = Math.round((solvedInTopic / totalInTopic) * 100);

      return {
        name: topic.name,
        icon: topic.icon,
        solved: solvedInTopic,
        total: totalInTopic,
        percentage: pct,
      };
    });

    return {
      totalSolved,
      easyTotal,
      mediumTotal,
      hardTotal,
      easySolved,
      mediumSolved,
      hardSolved,
      totalSubmissions,
      acceptanceRate,
      fastestRuntime: fastestRuntime === Infinity ? 0 : fastestRuntime,
      totalPoints,
      currentStreak,
      rankTitle,
      rankBadgeColor,
      activityMap,
      topicBreakdown,
    };
  }, [problems, submissions]);

  // Generate 52 weeks (364 days) of activity calendar cells
  const heatmapWeeks = useMemo(() => {
    const weeks: { dateStr: string; count: number }[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End on the nearest Saturday to align grid
    const dayOfWeek = today.getDay(); // 0 is Sun, 6 is Sat
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - dayOfWeek));

    // 52 weeks back
    const totalDays = 52 * 7;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);

    let currentDay = new Date(startDate);
    let currentWeek: { dateStr: string; count: number }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const count = analytics.activityMap[dateStr] || 0;

      currentWeek.push({ dateStr, count });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return weeks;
  }, [analytics.activityMap]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse text-sm">Loading coder analytics...</p>
      </main>
    );
  }

  // Ring chart circle math (radius 48)
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const totalProblemsCount = problems.length || 1;
  const strokeDashoffset =
    circumference - (analytics.totalSolved / totalProblemsCount) * circumference;

  const displayName = currentUser ? currentUser.email.split('@')[0] : 'Guest Coder';
  const displayEmail = currentUser ? currentUser.email : 'guest@judgelite.dev';

  return (
    <main className="max-w-6xl mx-auto p-6 pt-20 min-h-screen bg-slate-950 text-slate-100 space-y-6">
      {/* Guest Notice Banner */}
      {!currentUser && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-blue-300">
            <span className="text-base">ℹ️</span>
            <span>You are viewing in guest mode. Sign in to permanently track your rank, streak, and sync across devices!</span>
          </div>
          <Link href="/login" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition shrink-0 shadow-sm">
            Sign In / Register
          </Link>
        </div>
      )}

      {/* 1. Header Card */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-600/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-100">{displayName}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${analytics.rankBadgeColor}`}
              >
                {analytics.rankTitle}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{displayEmail}</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Acceptance</span>
            <span className="text-base font-bold text-emerald-400">
              {analytics.acceptanceRate}%
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Points</span>
            <span className="text-base font-bold text-amber-400">{analytics.totalPoints}</span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Fastest</span>
            <span className="text-base font-bold text-sky-400">
              {analytics.fastestRuntime > 0 ? `${analytics.fastestRuntime} ms` : '—'}
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Streak</span>
            <span className="text-base font-bold text-orange-400">
              🔥 {analytics.currentStreak}d
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Solved Ring Chart & Topic Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Circular Ring Chart + Difficulty Bars (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span>🎯</span> Solved Problems
          </h2>

          <div className="flex items-center justify-around gap-4 mb-6">
            {/* Donut Ring Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                  fill="transparent"
                />
                {/* Solved Progress Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{analytics.totalSolved}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  / {problems.length}
                </span>
              </div>
            </div>

            {/* Solved Percentage Tag */}
            <div className="text-right">
              <span className="text-3xl font-black text-blue-400">
                {problems.length > 0
                  ? Math.round((analytics.totalSolved / problems.length) * 100)
                  : 0}
                %
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Overall Completion</p>
            </div>
          </div>

          {/* Difficulty Breakdown Bars */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-400">Easy</span>
                <span className="text-slate-400 font-mono">
                  {analytics.easySolved} / {analytics.easyTotal}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      analytics.easyTotal > 0
                        ? (analytics.easySolved / analytics.easyTotal) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-400">Medium</span>
                <span className="text-slate-400 font-mono">
                  {analytics.mediumSolved} / {analytics.mediumTotal}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      analytics.mediumTotal > 0
                        ? (analytics.mediumSolved / analytics.mediumTotal) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-rose-400">Hard</span>
                <span className="text-slate-400 font-mono">
                  {analytics.hardSolved} / {analytics.hardTotal}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${
                      analytics.hardTotal > 0
                        ? (analytics.hardSolved / analytics.hardTotal) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Topic Mastery Breakdown (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <span>🧠</span> Skill & Topic Mastery
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Proficiency across core algorithm and data structure categories
            </p>

            <div className="space-y-3.5">
              {analytics.topicBreakdown.map((t) => (
                <div key={t.name} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">
                        {t.solved} / {t.total}
                      </span>
                      <span className="text-indigo-400 font-bold">{t.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Ready for more challenges?</span>
            <Link
              href="/problems"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Solve Next Problem →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 365-Day Submission Activity Heatmap */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>📅</span> Submission Activity Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {submissions.length} total submissions throughout the past 12 months
            </p>
          </div>

          {/* Hover Tooltip / Status */}
          <div className="text-xs font-mono text-slate-300 h-5">
            {hoveredDate ? (
              <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-emerald-400 font-semibold">
                {hoveredDate.date}: {hoveredDate.count} submission
                {hoveredDate.count === 1 ? '' : 's'}
              </span>
            ) : (
              <span className="text-slate-500">Hover over any square to see details</span>
            )}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-1">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                  let color = 'bg-slate-800/80';
                  if (day.count >= 3) {
                    color = 'bg-emerald-400 shadow-sm shadow-emerald-400/30';
                  } else if (day.count === 2) {
                    color = 'bg-emerald-600';
                  } else if (day.count === 1) {
                    color = 'bg-emerald-900';
                  }

                  return (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredDate({ date: day.dateStr, count: day.count })}
                      onMouseLeave={() => setHoveredDate(null)}
                      className={`w-3 h-3 rounded-sm transition-colors cursor-pointer ${color}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
          <span>Active Streak: {analytics.currentStreak} consecutive days</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-800/80" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-900" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Preview */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>⚡</span> Recent Submissions
          </h2>
          <Link
            href="/submissions"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            View All Submissions →
          </Link>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No submissions recorded yet. Head over to the problems catalog to make your first attempt!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-2">Problem</th>
                  <th className="pb-2">Verdict</th>
                  <th className="pb-2">Language</th>
                  <th className="pb-2">Runtime</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {submissions.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 font-sans font-medium text-slate-200">
                      {s.problem_slug ? (
                        <Link
                          href={`/problems/${s.problem_slug}`}
                          className="hover:text-blue-400 transition"
                        >
                          {s.problem_title || s.problem_slug}
                        </Link>
                      ) : (
                        s.problem_title || '—'
                      )}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          VERDICT_STYLE[s.verdict] || 'bg-slate-700 text-white'
                        }`}
                      >
                        {s.verdict}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{s.language}</td>
                    <td className="py-2.5 text-slate-300">
                      {s.execution_time_ms != null ? `${s.execution_time_ms} ms` : '—'}
                    </td>
                    <td className="py-2.5 text-right text-slate-500 font-sans">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
