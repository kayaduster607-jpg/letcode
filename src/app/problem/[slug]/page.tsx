import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ProblemClient from './ProblemClient';
import { problems } from '@/data/problems';
import { getCurrentUser } from '@/lib/auth';
import { getNextProblem, getPreviousProblem, getStageByProblemId } from '@/data/learningPath';

type ProblemPageProps = {
  params: Promise<{ slug: string }>;
};

function findProblemBySlug(slug: string) {
  return problems.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = findProblemBySlug(slug);

  if (!problem) {
    return {
      title: '题目不存在 — Hot100 学习助手',
    };
  }

  return {
    title: `${problem.title}｜Hot100 学习助手`,
    description: `${problem.titleEn}：${problem.learningGoal}`,
  };
}

export default async function ProblemPage({ params }: ProblemPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/problem/${slug}`);
  const problem = findProblemBySlug(slug);

  if (!problem) {
    notFound();
  }

  const stage = getStageByProblemId(problem.id);
  const previousProblemId = getPreviousProblem(problem.id);
  const nextProblemId = getNextProblem(problem.id);
  const previousProblemSlug = previousProblemId ? problems.find((item) => item.id === previousProblemId)?.slug || null : null;
  const nextProblemSlug = nextProblemId ? problems.find((item) => item.id === nextProblemId)?.slug || null : null;

  return <ProblemClient problem={problem} stage={stage} previousProblemSlug={previousProblemSlug} nextProblemSlug={nextProblemSlug} />;
}
