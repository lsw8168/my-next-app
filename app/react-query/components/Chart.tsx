'use client';

import React from 'react';
import { QueryComponent, useGraphData } from '../hooks/useFetchData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function Chart() {
  const { data, isLoading, isError, error } = useGraphData();

  return (
    <QueryComponent isLoading={isLoading} isError={isError} error={error}>
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            nonExistentProp={true}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              domain={['auto', 'auto']}
              tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
              type="number"
            />
            <YAxis />
            <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
            <Line type="monotone" dataKey="value" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </QueryComponent>
  );
}
