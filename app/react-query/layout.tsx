import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const metadata = {
  title: 'React Query Chart',
};

export default function ReactQueryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={<div>차트 영역에서 에러가 발생했습니다.</div>}>
      <Suspense fallback={<div>차트 영역 로딩 중...</div>}>{children}</Suspense>
    </ErrorBoundary>
  );
}
