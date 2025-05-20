import { useQuery } from '@tanstack/react-query';

export interface RawItem {
  timestamp: string;
  value: number;
}

export interface GraphPoint {
  time: number;
  value: number;
}

interface QueryComponentProps {
  children: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function QueryComponent({
  children,
  isLoading,
  isError,
  error,
}: QueryComponentProps) {
  if (isLoading) {
    return <div>그래프를 불러오는 중입니다...</div>;
  }

  if (isError) {
    return <div>그래프 에러가 발생했습니다: {error?.message}</div>;
  }

  return <>{children}</>;
}

export function useGraphData() {
  return useQuery<RawItem[], Error, GraphPoint[]>({
    queryKey: ['graph-data'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      return data as RawItem[];
    },
    select: (rawData: RawItem[]) => {
      return rawData.map((item: RawItem) => ({
        time: new Date(item.timestamp).getTime(),
        value: item.value,
      }));
    },
  });
}
