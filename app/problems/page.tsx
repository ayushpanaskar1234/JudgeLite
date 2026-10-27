import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import ProblemsClient from '@/components/ProblemsClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Problems',
  description: 'Practice and solve 35+ curated algorithmic challenges on JudgeLite.',
};

type Problem = {
  id: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  time_limit_ms: number;
};

async function getProblems(): Promise<Problem[]> {
  const { data, error } = await supabase
    .from('problems')
    .select('id,slug,title,difficulty,points,time_limit_ms')
    .order('difficulty', { ascending: true });
  if (error) {
    console.error('Failed to load problems:', error.message);
    return [];
  }
  return data as Problem[];
}

export default async function ProblemsPage() {
  const problems = await getProblems();
  return <ProblemsClient problems={problems} />;
}
