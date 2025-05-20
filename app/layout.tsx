import React, { Suspense } from 'react';
import './globals.css';
import Providers from './providers';
import { ErrorBoundary } from 'react-error-boundary';

export const metadata = {
  title: 'Graph App',
  description: 'Next.js App Router with React Query and Recharts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary fallback={<div>에러가 발생했습니다.</div>}>
            <Suspense fallback={<div>로딩 중...</div>}>{children}</Suspense>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
