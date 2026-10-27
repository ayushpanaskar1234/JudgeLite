'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
          ⚡ Powered by Judge0 CE
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Judge<span className="text-blue-400">Lite</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          A lightweight competitive programming platform. Write code, get instant feedback,
          and track your progress — all in your browser.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/problems"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-lg shadow-lg shadow-blue-600/30"
          >
            Solve Problems →
          </Link>
          <Link
            href="/submissions"
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors text-lg border border-slate-700"
          >
            View Submissions
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-slate-800 bg-slate-900/50 px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-bold mb-2 text-white">Instant Judging</h3>
            <p className="text-slate-400 text-sm">Parallel test-case execution via Judge0 CE. Results in seconds.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="text-lg font-bold mb-2 text-white">Monaco Editor</h3>
            <p className="text-slate-400 text-sm">VS Code-grade editor with syntax highlighting for C++, Java, and Python.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold mb-2 text-white">Track Progress</h3>
            <p className="text-slate-400 text-sm">Every submission saved. See your verdict history across all problems.</p>
          </div>
        </div>
      </section>

      <footer className="text-center text-slate-600 text-xs py-6 border-t border-slate-800">
        JudgeLite — Built with Next.js, Supabase &amp; Judge0
      </footer>
    </main>
  );
}
