import { NextResponse } from 'next/server';
import { RawItem } from '../../react-query/hooks/useFetchData';

export async function GET() {
  // 예시 데이터
  const data: RawItem[] = [
    { timestamp: '2024-01-01T00:00:00Z', value: 15 },
    { timestamp: '2024-02-01T00:00:00Z', value: 19 },
    { timestamp: '2024-03-01T00:00:00Z', value: 3 },
    { timestamp: '2024-04-01T00:00:00Z', value: 5 },
    { timestamp: '2024-05-01T00:00:00Z', value: 2 },
    { timestamp: '2024-06-01T00:00:00Z', value: 3 },
  ];

  return NextResponse.json(data);
}
