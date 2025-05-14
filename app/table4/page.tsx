import React from 'react';
import HierarchyTable, { TableNode } from './components/HierarchyTable';

const sampleData: TableNode[] = [
  {
    id: 1,
    name: '기술 부서',
    description: '소프트웨어 개발 및 기술 지원',
    type: '부서',
    children: [
      {
        id: 2,
        name: '프론트엔드 팀',
        description: '웹 프론트엔드 개발',
        type: '팀',
        children: [
          {
            id: 3,
            name: '홍길동',
            description: '시니어 프론트엔드 개발자',
            type: '개발자',
          },
          {
            id: 4,
            name: '김철수',
            description: '주니어 프론트엔드 개발자',
            type: '개발자',
          },
        ],
      },
      {
        id: 5,
        name: '백엔드 팀',
        description: '서버 및 API 개발',
        type: '팀',
        children: [
          {
            id: 6,
            name: '이영희',
            description: '백엔드 팀장',
            type: '팀장',
          },
        ],
      },
    ],
  },
  {
    id: 7,
    name: '영업',
    description: '영업부서',
    type: '부서',
    children: [
      {
        id: 8,
        name: '마케팅',
        description: '백엔드 팀장',
        type: '팀장',
      },
    ],
  },
];

function App() {
  return (
    <div>
      <h1>Expandable Hierarchy Table</h1>
      <HierarchyTable data={sampleData} />
    </div>
  );
}

export default App;
