import React from 'react';
import ChartWrapper from './components/ChartWrapper';
import { Graph } from './components/Graph';

export default function Page() {
  return (
    <main style={{ width: '100%', height: '400px' }}>
      <ChartWrapper />
      <Graph />
    </main>
  );
}
