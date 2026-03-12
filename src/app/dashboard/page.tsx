'use client';

import { useCaseStore } from '@/store/case-store';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import AppHeader from './_components/AppHeader';
import PageHeadline from './_components/PageHeadline';
import NewCaseButton from './_components/NewCaseButton';
import CaseCard from './_components/CaseCard';

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const cases = useCaseStore((s) => s.cases);
  const deleteCase = useCaseStore((s) => s.deleteCase);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between">
          <PageHeadline
            title={'외국인 1명 = 케이스 1개\n모든 서류와 진행상황을 한 곳에서 관리합니다'}
          />
          <NewCaseButton />
        </div>

        {cases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/10 bg-white/50 py-20 text-center">
            <p className="mb-4 text-sm text-black/40">아직 케이스가 없습니다</p>
            <NewCaseButton />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cases.map((c) => (
              <CaseCard key={c.id} caseData={c} onDelete={deleteCase} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
