import { Position } from '@xyflow/react';
import * as dagre from '@dagrejs/dagre';

// 노드 기본 설정
const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
  },
};

// 커스텀 타입 정의
interface NodeData {
  id: string;
  type: string;
  data: {
    label: string;
    iconName: string;
  };
  sourcePosition?: Position;
  targetPosition?: Position;
  style?: Record<string, string | number>;
  position?: { x: number; y: number };
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  style?: Record<string, string | number>;
  animated?: boolean;
}

// 노드와 간선 정보
const nodeData: NodeData[] = [
  {
    id: '1',
    type: 'custom',
    data: {
      label: '사용자',
      iconName: 'user',
    },
    ...nodeDefaults,
  },
  {
    id: '2',
    type: 'custom',
    data: {
      label: '홈',
      iconName: 'home',
    },
    ...nodeDefaults,
  },
  {
    id: '3',
    type: 'custom',
    data: {
      label: '빌딩',
      iconName: 'building',
    },
    ...nodeDefaults,
  },
  {
    id: '4',
    type: 'custom',
    data: {
      label: '설정',
      iconName: 'cog',
    },
    ...nodeDefaults,
  },
  {
    id: '5',
    type: 'custom',
    data: {
      label: '북마크',
      iconName: 'bookmark',
    },
    ...nodeDefaults,
  },
  {
    id: '6',
    type: 'custom',
    data: {
      label: '메일',
      iconName: 'envelope',
    },
    ...nodeDefaults,
  },
  {
    id: '7',
    type: 'custom',
    data: {
      label: '전화',
      iconName: 'phone',
    },
    ...nodeDefaults,
  },
  {
    id: '8',
    type: 'custom',
    data: {
      label: '즐겨찾기',
      iconName: 'star',
    },
    ...nodeDefaults,
  },
];

const edgeData: EdgeData[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
  },
  {
    id: 'e3-5',
    source: '3',
    target: '5',
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
  },
  {
    id: 'e4-7',
    source: '4',
    target: '7',
  },
  {
    id: 'e5-8',
    source: '5',
    target: '8',
  },
];

// 레이아웃 계산 함수
const getLayoutedElements = (
  nodes: NodeData[],
  edges: EdgeData[],
  direction = 'LR'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  // 노드 크기 설정 (일반적인 값으로 설정)
  const nodeWidth = 150;
  const nodeHeight = 50;

  // 노드 추가
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 엣지 추가
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 레이아웃 계산
  dagre.layout(dagreGraph);

  // 계산된 위치로 노드 업데이트
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges: edges.map((edge) => ({
      ...edge,
      sourceHandle: 'source',
      targetHandle: 'target',
      style: { stroke: '#333', strokeWidth: 2 },
      animated: true,
    })),
  };
};

// 자동 배치된 노드와 엣지 생성
const { nodes: initialNodes, edges: initialEdges } = getLayoutedElements(
  nodeData,
  edgeData
);

export { initialEdges, initialNodes };
