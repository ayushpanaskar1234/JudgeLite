import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import ProblemWorkspaceLeftPane from '@/components/ProblemWorkspaceLeftPane';
import ProblemEditor from '@/components/ProblemEditor';
import { Suspense } from 'react';
import { marked } from 'marked';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const problem = await getProblemBySlug(params.slug);
  return {
    title: problem ? problem.title : 'Problem Details',
    description: problem
      ? `Solve ${problem.title} (${problem.difficulty}) on JudgeLite.`
      : 'Solve algorithm problems on JudgeLite.',
  };
}

type Params = {
  slug: string;
};

type Problem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  time_limit_ms: number;
};

type TestCase = {
  input: string;
  output: string;
};

type FullTestCase = {
  input: string;
  output: string;
  is_sample: boolean;
};

async function getProblemBySlug(slug: string): Promise<Problem | null> {
  const { data, error } = await supabase
    .from('problems')
    .select('id,slug,title,description_markdown,difficulty,points,time_limit_ms')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching problem by slug:', error);
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: (data as any).description_markdown || '',
    difficulty: data.difficulty,
    points: data.points,
    time_limit_ms: data.time_limit_ms,
  };
}

async function getTestCases(
  problemId: string,
  slug: string
): Promise<{ sampleCases: TestCase[]; allCases: FullTestCase[] }> {
  const { data, error } = await supabase
    .from('test_cases')
    .select('input,expected_output,is_sample,order_index')
    .eq('problem_id', problemId)
    .order('order_index', { ascending: true });

  if (error || !data || data.length === 0) {
    return { sampleCases: [], allCases: [] };
  }

  const allCases: FullTestCase[] = data.map((row: any) => ({
    input: row.input,
    output: row.expected_output,
    is_sample: Boolean(row.is_sample),
  }));

  const sampleCases: TestCase[] = allCases
    .filter((tc) => tc.is_sample)
    .map((tc) => ({ input: tc.input, output: tc.output }));

  return { sampleCases, allCases };
}

export default async function ProblemPage({ params }: { params: Params }) {
  const { slug } = params;
  const problem = await getProblemBySlug(slug);

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center max-w-md">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Problem Not Found</h2>
          <p className="text-slate-400 text-sm mb-4">
            The problem with slug "{slug}" does not exist.
          </p>
          <a
            href="/problems"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition"
          >
            Back to Problems
          </a>
        </div>
      </div>
    );
  }

  const { sampleCases, allCases } = await getTestCases(problem.id, problem.slug);
  const descriptionHtml = await marked.parse(problem.description, { gfm: true, breaks: true });

  return (
    <div className="flex h-[calc(100vh-57px)] bg-slate-950 text-white overflow-hidden">
      {/* Left Pane – 3 Tabs: Description, Hints (3), and Editorial */}
      <ProblemWorkspaceLeftPane
        problem={{
          id: problem.id,
          slug: problem.slug,
          title: problem.title,
          descriptionHtml,
          difficulty: problem.difficulty,
          points: problem.points,
          time_limit_ms: problem.time_limit_ms,
        }}
        sampleCases={sampleCases}
      />

      {/* Right Pane – Monaco Editor & Tabbed Test Runner */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-6 text-slate-400">Loading editor...</div>}>
          <ProblemEditor
            problemId={problem.id}
            problemTitle={problem.title}
            sampleCases={sampleCases}
            allTestCases={allCases}
            slug={problem.slug}
          />
        </Suspense>
      </div>
    </div>
  );
}
