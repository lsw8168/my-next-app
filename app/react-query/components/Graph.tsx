'use client';

import {
  useGraphData,
  QueryComponent,
  GraphPoint,
} from '../hooks/useFetchData';

export function Graph() {
  const { data, isLoading, isError, error } = useGraphData();

  return (
    <QueryComponent isLoading={isLoading} isError={isError} error={error}>
      <div>
        {data?.map((point: GraphPoint) => (
          <div key={point.time}>
            시간: {new Date(point.time).toLocaleString()}, 값: {point.value}
          </div>
        ))}
      </div>
    </QueryComponent>
  );
}
