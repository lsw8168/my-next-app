'use client';

import { useCallback, memo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
  ReactFlowProvider,
  Position,
  Panel,
  type NodeProps,
  Handle,
  type EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useUpdateNodeInternals,
  type ReactFlowInstance,
} from 'reactflow';
import * as dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import { FaPlay, FaStop, FaCog, FaCheck } from 'react-icons/fa';

/* ---------- 1. 공통 스타일 ---------- */
const customStyles = `
  .react-flow__node {
    border: none !important;
    box-shadow: none !important;
    background: none !important;
  }

  .react-flow__node-default,
  .react-flow__node-input,
  .react-flow__node-output,
  .react-flow__node-group {
    padding: 0 !important;
  }
`;

/* ---------- 2. 커스텀 노드 ---------- */
interface CustomNodeData {
  label: string;
  description: string;
}

const CustomNode = memo(
  ({ data, isConnectable, type }: NodeProps<CustomNodeData>) => {
    const getNodeStyle = () => {
      switch (type) {
        case 'input':
          return {
            background: '#f0f9ff',
            border: '1px solid #7dd3fc',
            color: '#0369a1',
          };
        case 'output':
          return {
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
          };
        case 'custom':
          return {
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#15803d',
          };
        default:
          return {
            background: '#f5f5f5',
            border: '1px solid #ffd591',
            color: '#333',
          };
      }
    };

    const nodeStyle = {
      ...getNodeStyle(),
      width: '120px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const getIcon = () => {
      switch (type) {
        case 'input':
          return <FaPlay className="mr-2" style={{ color: '#0369a1' }} />;
        case 'output':
          return <FaStop className="mr-2" style={{ color: '#b91c1c' }} />;
        case 'custom':
          return <FaCog className="mr-2" style={{ color: '#15803d' }} />;
        default:
          return <FaCheck className="mr-2" style={{ color: '#333' }} />;
      }
    };

    const getHandlePosition = (type: 'source' | 'target') => {
      const direction =
        document.querySelector('.react-flow')?.getAttribute('data-direction') ||
        'LR';
      if (direction === 'TB') {
        return type === 'source' ? Position.Bottom : Position.Top;
      }
      return type === 'source' ? Position.Right : Position.Left;
    };

    const getHandleStyle = () => {
      const direction =
        document.querySelector('.react-flow')?.getAttribute('data-direction') ||
        'LR';
      if (direction === 'TB') {
        return {
          left: '50%',
          transform: 'translateX(-50%)',
        };
      }
      return {
        top: '50%',
        transform: 'translateY(-50%)',
      };
    };

    return (
      <div className="flex flex-col items-center">
        <div className="relative rounded-md shadow-md" style={nodeStyle}>
          <Handle
            type="target"
            position={getHandlePosition('target')}
            isConnectable={isConnectable}
            style={getHandleStyle()}
          />

          <div
            className="font-medium flex items-center"
            style={{ color: getNodeStyle().color }}
          >
            {getIcon()}
            {data.label}
          </div>

          <Handle
            type="source"
            position={getHandlePosition('source')}
            isConnectable={isConnectable}
            style={getHandleStyle()}
          />
        </div>

        <div className="mt-1 text-xs text-gray-600 max-w-[150px] text-center">
          {data.description}
        </div>
      </div>
    );
  }
);
CustomNode.displayName = 'CustomNode';

/* ---------- 3. 커스텀 엣지 ---------- */
const calculateLabelWidth = (data: { startLabel?: string }) => {
  return data?.startLabel ? data.startLabel.length * 7.2 + 16 : 0;
};

const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const direction =
    document.querySelector('.react-flow')?.getAttribute('data-direction') ||
    'LR';

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right,
    targetX,
    targetY,
    targetPosition: direction === 'TB' ? Position.Top : Position.Left,
    curvature: 0.5,
  });
  const labelOffset = direction === 'TB' ? 20 : 30;

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Label clicked:', data?.startLabel);
  };

  const labelWidth = calculateLabelWidth(data);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#b1b1b7',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform:
              direction === 'TB'
                ? `translate(-50%, 0%) translate(${sourceX}px, ${
                    sourceY + labelOffset
                  }px)`
                : `translate(0%, -50%) translate(${sourceX}px, ${
                    sourceY + labelOffset
                  }px)`,
            fontSize: 12,
            pointerEvents: 'all',
            width: labelWidth,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          className="nodrag nopan"
          onClick={handleLabelClick}
        >
          {data?.startLabel && (
            <div style={{ padding: '2px 4px' }}>{data.startLabel}</div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            transform:
              direction === 'TB'
                ? `translate(-50%, 0%) translate(${targetX}px, ${
                    targetY - labelOffset
                  }px)`
                : `translate(-50%, -50%) translate(${targetX}px, ${
                    targetY + labelOffset
                  }px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data?.endLabel && (
            <div
              style={{
                background: '#fff',
                padding: '2px 4px',
                borderRadius: 2,
              }}
            >
              {data.endLabel}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

/* ---------- 4. 초기 데이터 ---------- */
const initialNodes: Omit<Node<CustomNodeData>, 'position'>[] = [
  { id: '1', type: 'input', data: { label: '시작', description: 'test' } },
  {
    id: '2',
    type: 'custom',
    data: { label: '프로세스 1', description: 'test' },
  },
  {
    id: '3',
    type: 'custom',
    data: { label: '프로세스 2', description: 'test' },
  },
  {
    id: '4',
    type: 'custom',
    data: { label: '프로세스 3', description: 'test' },
  },
  { id: '5', type: 'output', data: { label: '종료', description: 'test' } },
];
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, type: 'straight' },
  {
    id: 'e1-3',
    source: '2',
    target: '3',
    animated: true,
    type: 'start-end',
    data: { startLabel: '1' },
  },
  {
    id: 'e2-4',
    source: '3',
    target: '4',
    type: 'start-end',
    data: { startLabel: 'start edge label' },
  },
  { id: 'e3-4', source: '4', target: '5', label: 'Yes', type: 'straight' },
];

const nodeWidth = 150;
const nodeHeight = 60;

/* ---------- 5. Dagre 레이아웃 ---------- */
const getLayoutedElements = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
) => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: direction });

  // 노드별 startLabel 최대 너비 계산
  const labelMap: Record<string, number> = {};
  edges.forEach((edge) => {
    const text = edge.data?.startLabel;
    if (text) {
      const w = text.length * 7.2 + 16;
      labelMap[edge.source] = Math.max(labelMap[edge.source] || 0, w);
    }
  });

  // 노드 사이즈 설정
  nodes.forEach((n) => {
    const extra = labelMap[n.id] || 0;
    graph.setNode(n.id, { width: nodeWidth + extra, height: nodeHeight });
  });

  edges.forEach((e) => graph.setEdge(e.source, e.target));
  dagre.layout(graph);

  // 위치 재계산
  const laidOut = nodes.map((n) => {
    const { x, y } = graph.node(n.id);
    const extra = labelMap[n.id] || 0;
    return {
      ...n,
      position: { x: x - (nodeWidth + extra) / 2, y: y - nodeHeight / 2 },
    };
  });

  return { nodes: laidOut, edges };
};

/* ---------- 6. 노드·엣지 타입 ---------- */
const nodeTypes = {
  custom: CustomNode,
  input: CustomNode,
  output: CustomNode,
  default: CustomNode,
};

const edgeTypes = {
  'start-end': CustomEdge,
};

/* ---------- 7. 레이아웃 초기화 ---------- */
const { nodes: startNodes } = getLayoutedElements(
  initialNodes.map((n, i) => ({ ...n, position: { x: 0, y: i * 100 } })),
  initialEdges,
  'LR'
);

/* ---------- 8. 최상위 페이지 ---------- */
export default function FlowChartPage() {
  return (
    <div className="w-full h-screen">
      <style>{customStyles}</style>
      <ReactFlowProvider>
        <FlowChart />
      </ReactFlowProvider>
    </div>
  );
}

/* ---------- 9. FlowChart 컴포넌트 ---------- */
function FlowChart() {
  const [nodes, setNodes, onNodesChange] = useNodesState(startNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');

  /* v12: updateNodeInternals 훅 사용 */
  const updateNodeInternals = useUpdateNodeInternals();

  const handleLayout = useCallback(
    (dir: 'LR' | 'TB') => {
      setLayoutDirection(dir);
      const updatedEdges = edges.map((edge) => ({
        ...edge,
        type: 'start-end',
        data: {
          ...edge.data,
          direction: dir,
        },
      }));
      setEdges(updatedEdges);
      const { nodes: ln, edges: le } = getLayoutedElements(
        nodes,
        updatedEdges,
        dir
      );
      setNodes([...ln]);
      setEdges([...le]);

      /* 노드 내부 캐시 강제 갱신 */
      ln.forEach((n) => updateNodeInternals(n.id));

      /* 방향 속성 + fitView */
      requestAnimationFrame(() => {
        const el = document.querySelector('.react-flow') as HTMLElement & {
          __reactFlowInstance?: ReactFlowInstance;
        };
        el?.setAttribute?.('data-direction', dir);
        el?.__reactFlowInstance?.fitView();
      });
    },
    [edges, setEdges, nodes, setNodes, updateNodeInternals]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      attributionPosition="bottom-right"
      defaultEdgeOptions={{
        type: 'start-end',
        labelStyle: { fill: '#333', fontSize: 12 },
        labelBgStyle: { fill: '#fff', borderRadius: 2 },
        labelBgPadding: [4, 4],
        labelBgBorderRadius: 2,
      }}
      data-direction={layoutDirection}
    >
      <Controls />
      <MiniMap />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

      {/* 레이아웃 토글 */}
      <Panel position="top-right">
        <div className="flex gap-2">
          <button
            onClick={() => handleLayout('LR')}
            className={`px-4 py-2 rounded ${
              layoutDirection === 'LR'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            가로 정렬
          </button>
          <button
            onClick={() => handleLayout('TB')}
            className={`px-4 py-2 rounded ${
              layoutDirection === 'TB'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            세로 정렬
          </button>
        </div>
      </Panel>
    </ReactFlow>
  );
}
