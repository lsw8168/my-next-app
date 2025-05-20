'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), { ssr: false });

export default function ChartWrapper() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Chart />
    </div>
  );
}
