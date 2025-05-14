'use client';

import { useCallback, memo, useState, useRef, useEffect, useMemo } from 'react'; // useMemo 추가
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
  MarkerType,
  useReactFlow,
} from 'reactflow';
import * as dagre from '@dagrejs/dagre';
import 'reactflow/dist/base.css';
import { FaPlay, FaStop, FaCog, FaCheck } from 'react-icons/fa';

/* ---------- 1. 공통 스타일 ---------- */
const customStyles = `
  .react-flow__node {
    border: none !important;
    box-shadow: none !important;
    background: none !important;
  }
`;

/* ---------- 2. 커스텀 노드 ---------- */
interface CustomNodeData {
  label: string;
  description: string;
  direction: 'LR' | 'TB'; // 레이아웃 방향
}

// CustomNode 컴포넌트는 이미 memo로 감싸져 있고, 컴포넌트 외부에서 정의되었으므로 문제 없습니다.
const CustomNode = memo(
  ({ data, isConnectable, type }: NodeProps<CustomNodeData>) => {
    const { direction } = data;

    // 노드 타입에 따른 스타일 반환
    const getNodeStyle = () => {
      switch (type) {
        case 'input': // 시작 노드 스타일
          return {
            background: '#f0f9ff', // 하늘색 배경
            border: '1px solid #7dd3fc', // 하늘색 테두리
            color: '#0369a1', // 진한 파란색 텍스트
          };
        case 'output': // 종료 노드 스타일
          return {
            background: '#fef2f2', // 연한 빨간색 배경
            border: '1px solid #fca5a5', // 연한 빨간색 테두리
            color: '#b91c1c', // 진한 빨간색 텍스트
          };
        case 'custom': // 일반 처리 노드 스타일
          return {
            background: '#f0fdf4', // 연한 녹색 배경
            border: '1px solid #86efac', // 연한 녹색 테두리
            color: '#15803d', // 진한 녹색 텍스트
          };
        default: // 기본 노드 스타일
          return {
            background: '#f5f5f5', // 연한 회색 배경
            border: '1px solid #ffd591', // 연한 주황색 테두리
            color: '#333', // 검정색 텍스트
          };
      }
    };

    // 최종 노드 스타일 객체
    const nodeStyle = {
      ...getNodeStyle(),
      width: '120px', // 너비
      height: '40px', // 높이
      display: 'flex',
      alignItems: 'center', // 수직 중앙 정렬
      justifyContent: 'center', // 수평 중앙 정렬
    } as const;

    // 노드 타입에 따른 아이콘 반환
    const getIcon = () => {
      switch (type) {
        case 'input':
          return <FaPlay className="mr-2" style={{ color: '#0369a1' }} />; // 재생 아이콘
        case 'output':
          return <FaStop className="mr-2" style={{ color: '#b91c1c' }} />; // 정지 아이콘
        case 'custom':
          return <FaCog className="mr-2" style={{ color: '#15803d' }} />; // 설정 아이콘
        default:
          return <FaCheck className="mr-2" style={{ color: '#333' }} />; // 체크 아이콘
      }
    };

    // 핸들(연결점) 위치 반환 (레이아웃 방향에 따라)
    const getHandlePosition = (handleType: 'source' | 'target') => {
      if (direction === 'TB') {
        // Top-Bottom 방향
        return handleType === 'source' ? Position.Bottom : Position.Top;
      }
      // Left-Right 방향 (기본값)
      return handleType === 'source' ? Position.Right : Position.Left;
    };

    // 핸들 스타일 반환
    const getHandleStyle = () => {
      const baseStyle = {
        width: '8px',
        height: '8px',
        borderRadius: '50%', // 원형
        border: '1px solid white', // 흰색 테두리
        boxShadow: '0 0 2px rgba(0, 0, 0, 0.3)', // 그림자 효과
      };

      // 노드 타입별 핸들 배경색
      const colorStyle: Record<string, { background: string }> = {
        input: { background: '#0369a1' },
        output: { background: '#b91c1c' },
        custom: { background: '#15803d' },
        default: { background: '#333' },
      };

      // 레이아웃 방향별 핸들 위치 조정
      const positionStyle =
        direction === 'TB'
          ? { left: '50%', transform: 'translateX(-50%)' } // 상하 중앙
          : { top: '50%', transform: 'translateY(-50%)' }; // 좌우 중앙

      // type이 정의되지 않은 경우를 대비하여 기본값 처리 추가
      const nodeTypeKey = type && colorStyle[type] ? type : 'default';

      return {
        ...baseStyle,
        ...colorStyle[nodeTypeKey], // 타입이 없거나 colorStyle에 없으면 기본값 사용
        ...positionStyle,
      } as const;
    };

    return (
      <div className="flex flex-col items-center">
        {/* 노드 본체 */}
        <div className="relative rounded-md shadow-md" style={nodeStyle}>
          {/* 타겟 핸들 (들어오는 연결) */}
          <Handle
            type="target"
            position={getHandlePosition('target')}
            isConnectable={isConnectable}
            style={getHandleStyle()}
          />
          {/* 노드 내용 (아이콘 + 레이블) */}
          <div
            className="font-medium flex items-center"
            style={{ color: getNodeStyle().color }}
          >
            {getIcon()}
            {data.label}
          </div>
          {/* 소스 핸들 (나가는 연결) */}
          <Handle
            type="source"
            position={getHandlePosition('source')}
            isConnectable={isConnectable}
            style={getHandleStyle()}
          />
        </div>
        {/* 노드 설명 */}
        <div className="mt-1 text-xs text-gray-600 max-w-[150px] text-center">
          {data.description}
        </div>
      </div>
    );
  }
);
CustomNode.displayName = 'CustomNode'; // 디버깅 시 컴포넌트 이름 표시

/* ---------- 3. 커스텀 엣지 ---------- */
// CustomEdge 컴포넌트도 컴포넌트 외부에서 정의되었으므로 문제 없습니다.
const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd, // 화살표 마커
  data, // 엣지 데이터 (레이블 등)
}: EdgeProps) => {
  // 현재 레이아웃 방향 가져오기 (ReactFlow 컴포넌트의 data-direction 속성 사용)
  const direction =
    typeof document !== 'undefined' // 서버 사이드 렌더링 방지
      ? document.querySelector('.react-flow')?.getAttribute('data-direction') ||
        'LR'
      : 'LR'; // 기본값 'LR'

  // 베지어 곡선 경로 계산
  const [edgePath] = getBezierPath({
    // labelX, labelY 추가 (레이블 위치 계산용)
    sourceX,
    sourceY,
    sourcePosition: direction === 'TB' ? Position.Bottom : Position.Right, // 방향에 따른 소스 핸들 위치
    targetX,
    targetY,
    targetPosition: direction === 'TB' ? Position.Top : Position.Left, // 방향에 따른 타겟 핸들 위치
    curvature: 0.5, // 곡률
  });

  // 레이블 위치 오프셋 (엣지와의 거리)
  const labelOffset = direction === 'TB' ? 20 : 30; // 오프셋 조정 (필요시)

  // 시작 레이블 클릭 핸들러
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    console.log('엣지 시작 레이블 클릭:', data?.startLabel);
  };

  return (
    <>
      {/* 엣지 경로 (선) */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd} // 끝점 마커 (화살표)
        style={{
          strokeWidth: 2, // 선 두께
          stroke: '#4a5568', // 선 색상 (회색)
          ...style, // 추가 스타일 적용
        }}
      />
      {/* 엣지 레이블 렌더러 */}
      <EdgeLabelRenderer>
        {/* 시작 레이블 */}
        {data?.startLabel && (
          <div
            style={{
              position: 'absolute',
              // getBezierPath에서 제공하는 중앙점 근처에 배치 (오프셋 조정 가능)
              transform:
                direction === 'TB'
                  ? `translate(-50%, 0%) translate(${sourceX}px, ${
                      sourceY + labelOffset
                    }px)`
                  : `translate(0%, -50%) translate(${sourceX}px, ${
                      sourceY + labelOffset
                    }px)`,
              fontSize: 12,
              pointerEvents: 'all', // 클릭 이벤트 활성화
              // width: labelWidth, // 너비 자동 조절되도록 제거 또는 min/max-width 사용 고려
              padding: '2px 4px',
              whiteSpace: 'nowrap', // 줄바꿈 방지
              cursor: 'pointer', // 클릭 가능 표시
            }}
            className="nodrag nopan" // 드래그, 패닝 비활성화
            onClick={handleLabelClick} // 클릭 핸들러 연결
          >
            {data.startLabel}
          </div>
        )}
        {/* 종료 레이블 (필요시 사용) */}
        {data?.endLabel && (
          <div
            style={{
              position: 'absolute',
              // 시작 레이블과 반대 방향 오프셋 적용
              transform:
                direction === 'TB'
                  ? `translate(-50%, 0%) translate(${targetX}px, ${
                      targetY - labelOffset
                    }px)`
                  : `translate(-50%, -50%) translate(${targetX}px, ${
                      targetY + labelOffset
                    }px)`,
              fontSize: 12,
              pointerEvents: 'all', // 클릭 이벤트 활성화 (필요시)
              padding: '2px 4px', // 패딩
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {data.endLabel}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

/* ---------- 4. 초기 데이터 ---------- */
// 초기 노드 데이터 (위치 제외)
const baseNodes: Omit<Node<CustomNodeData>, 'position'>[] = [
  {
    id: '1',
    type: 'input', // 시작 노드 타입
    data: { label: '시작', description: '워크플로우 시작점', direction: 'LR' },
  },
  {
    id: '2',
    type: 'custom', // 일반 처리 노드 타입
    data: {
      label: '데이터 로드',
      description: '데이터 소스에서 로드',
      direction: 'LR',
    },
  },
  {
    id: '3',
    type: 'custom',
    data: {
      label: '데이터 처리',
      description: '데이터 변환 및 정제',
      direction: 'LR',
    },
  },
  {
    id: '4',
    type: 'custom',
    data: {
      label: '모델 학습',
      description: '머신러닝 모델 학습',
      direction: 'LR',
    },
  },
  {
    id: '5',
    type: 'output', // 종료 노드 타입
    data: {
      label: '결과 저장',
      description: '처리 결과 저장',
      direction: 'LR',
    },
  },
];

// 초기 엣지 데이터
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1', // 시작 노드 ID
    target: '2', // 타겟 노드 ID
    animated: true, // 애니메이션 효과
    type: 'straight', // 직선 엣지 (커스텀 엣지 대신 기본 타입 사용 예시)
    markerEnd: {
      // 끝점 마커 (화살표)
      type: MarkerType.ArrowClosed, // 닫힌 화살표
      width: 20,
      height: 20,
      color: '#FF0072', // 마커 색상
    },
    style: {
      // 엣지 스타일
      strokeWidth: 2, // 선 두께
      stroke: '#FF0072', // 선 색상
    },
  },
  {
    id: 'e2-3', // 엣지 ID 수정됨
    source: '2',
    target: '3',
    animated: true,
    type: 'start-end', // 커스텀 엣지 타입 사용
    data: { startLabel: '처리처리처리처리처리처리처리처리처리처리처리' },
  },
  {
    id: 'e3-4', // 엣지 ID 수정됨
    source: '3',
    target: '4',
    type: 'start-end',
    data: { startLabel: '처리 완료 데이터' }, // 시작 레이블 데이터
  },
  {
    id: 'e4-5', // 엣지 ID 수정됨
    source: '4',
    target: '5',
    label: '학습 완료학습 완료학습 완료', // 기본 레이블 (React Flow 기본 렌더링 사용)
    type: 'straight', // 직선 엣지
  },
];

const nodeWidth = 150; // 노드 너비 (레이아웃 계산용)
const nodeHeight = 60; // 노드 높이 (레이아웃 계산용) + 설명 높이 고려 필요 시 조정

/* ---------- 5. Dagre 레이아웃 ---------- */
// Dagre 라이브러리를 이용한 자동 레이아웃 함수
// 이 함수는 컴포넌트 외부에서 정의되었으므로 문제 없습니다.
function getLayoutedElements(
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR' // 레이아웃 방향 (기본값 'LR')
) {
  const graph = new dagre.graphlib.Graph(); // Dagre 그래프 객체 생성
  graph.setDefaultEdgeLabel(() => ({})); // 기본 엣지 레이블 설정 (없음)
  graph.setGraph({ rankdir: direction }); // 그래프 방향 설정 (LR: 왼쪽->오른쪽, TB: 위->아래)

  /* 시작 레이블 너비를 고려한 노드 너비 계산 */
  const labelMap: Record<string, number> = {}; // 노드 ID별 추가 너비 저장 맵
  edges.forEach((edge) => {
    const text = (edge.data as { startLabel?: string })?.startLabel;
    if (text && typeof document !== 'undefined') {
      // 텍스트가 있고, 브라우저 환경일 때만
      // 간단한 너비 추정 (정확한 계산은 calculateLabelWidth 사용 고려)
      const width = text.length * 7.2 + 16; // 글자당 약 7.2px + 패딩 16px
      // 해당 소스 노드에 필요한 최대 추가 너비 저장
      labelMap[edge.source] = Math.max(labelMap[edge.source] || 0, width);
    }
  });

  // 노드를 그래프에 추가 (계산된 추가 너비 반영)
  nodes.forEach((n) => {
    const extraWidth = labelMap[n.id] || 0; // 해당 노드의 시작 레이블로 인한 추가 너비
    // 노드 크기 설정 (기본 너비 + 추가 너비, 기본 높이)
    // 실제 노드 크기(120x40)와 레이아웃 계산용 크기(nodeWidth, nodeHeight)가 다름에 유의
    // 여기서는 레이아웃 계산용 크기를 사용
    graph.setNode(n.id, { width: nodeWidth + extraWidth, height: nodeHeight });
  });

  // 엣지를 그래프에 추가
  edges.forEach((e) => graph.setEdge(e.source, e.target));

  // Dagre 레이아웃 계산 실행
  dagre.layout(graph);

  // 계산된 위치를 노드 데이터에 적용
  const laidOutNodes = nodes.map((n) => {
    const nodeWithPosition = graph.node(n.id); // 그래프에서 노드 위치 정보 가져오기
    const extraWidth = labelMap[n.id] || 0; // 해당 노드의 추가 너비
    return {
      ...n,
      // 노드 위치 설정 (중앙 정렬 기준 좌표이므로 좌상단 좌표로 변환)
      position: {
        x: nodeWithPosition.x - (nodeWidth + extraWidth) / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      // 노드 데이터에 방향 정보 업데이트 (CustomNode에서 사용)
      data: {
        ...n.data,
        direction: direction,
      },
    };
  });

  return { nodes: laidOutNodes, edges }; // 레이아웃 적용된 노드와 기존 엣지 반환
}

/* ---------- 6. 노드·엣지 타입 ---------- */
// nodeTypes와 edgeTypes는 컴포넌트 외부의 최상위 레벨에서 정의되었습니다.
// 이는 React Flow가 권장하는 방식이며, 렌더링 시마다 객체가 재생성되지 않습니다.
// 따라서 이 부분은 경고의 원인이 아닙니다.
const nodeTypes = {
  custom: CustomNode,
  input: CustomNode,
  output: CustomNode,
  default: CustomNode, // 기본 타입도 CustomNode 사용
};

const edgeTypes = {
  'start-end': CustomEdge, // 'start-end' 라는 이름으로 CustomEdge 컴포넌트 사용
};

/* ---------- 7. 레이아웃 초기화 ---------- */
// 초기 노드 위치 계산 (LR 방향 기준)
// 이 계산도 컴포넌트 외부에서 수행됩니다.
const { nodes: initialNodes } = getLayoutedElements(
  // 초기 노드 데이터에 임시 위치 할당 (Dagre 계산 전 필요)
  baseNodes.map((n, i) => ({
    ...n,
    position: { x: 0, y: i * 100 }, // 임시 Y 좌표
  })),
  initialEdges,
  'LR' // 초기 방향 'LR'
);

/* ---------- 8. 최상위 페이지 컴포넌트 ---------- */
export default function FlowChartPage() {
  return (
    <div className="w-full h-screen">
      <style>{customStyles}</style> {/* 공통 스타일 주입 */}
      <ReactFlowProvider>
        {' '}
        {/* React Flow 컨텍스트 제공 */}
        <FlowChart />
      </ReactFlowProvider>
    </div>
  );
}

/* ---------- 9. FlowChart 컴포넌트 ---------- */
function FlowChart() {
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR'); // 현재 레이아웃 방향 상태
  const { zoomTo } = useReactFlow(); // React Flow 훅 (줌 기능 사용)
  const [zoomLevel, setZoomLevel] = useState(1); // 현재 줌 레벨 상태

  // 노드 데이터 배열에 방향 정보 일괄 적용하는 헬퍼 함수
  const applyDirectionToNodes = (
    nodes: Node<CustomNodeData>[],
    dir: 'LR' | 'TB'
  ) =>
    nodes.map((node) => ({
      ...node,
      data: { ...node.data, direction: dir }, // data 객체 내 direction 업데이트
    }));

  // React Flow 상태 관리 훅
  // 초기 노드 설정 시 applyDirectionToNodes를 사용하여 초기 방향('LR')을 명시적으로 설정합니다.
  const [nodes, setNodes, onNodesChange] = useNodesState(
    applyDirectionToNodes(initialNodes, 'LR') // 초기 방향 적용
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges); // 초기 엣지 설정

  const updateNodeInternals = useUpdateNodeInternals(); // 노드 내부 상태 업데이트 함수
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null); // React Flow 인스턴스 참조

  /* 윈도우 리사이즈 시 fitView 적용 */
  useEffect(() => {
    const handleResize = () => {
      // 인스턴스가 준비되면 fitView 실행
      reactFlowInstance.current?.fitView({ padding: 0.2, duration: 0 });
    };
    window.addEventListener('resize', handleResize);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 빈 의존성 배열: 마운트 시 한 번만 실행

  /* 레이아웃 방향 변경 핸들러 */
  const handleLayout = useCallback(
    (dir: 'LR' | 'TB') => {
      setLayoutDirection(dir); // 레이아웃 방향 상태 업데이트

      // 노드 데이터에 새로운 방향 적용
      const nodesWithNewDirection = applyDirectionToNodes(nodes, dir);
      // 엣지 데이터 업데이트 (커스텀 엣지에서 방향 사용 시 필요할 수 있음)
      const updatedEdges = edges.map((e) => ({
        ...e,
        // type: 'start-end', // 모든 엣지를 커스텀 타입으로 강제할 필요는 없음
        data: { ...e.data, direction: dir }, // 엣지 데이터에도 방향 정보 추가 (CustomEdge에서 사용 시)
      }));

      // 새로운 방향으로 레이아웃 재계산
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(
          nodesWithNewDirection,
          updatedEdges, // 업데이트된 엣지 사용
          dir
        );

      // 상태 업데이트 (새로운 노드/엣지 정보로)
      setNodes(layoutedNodes); // 새로운 배열로 전달하여 변경 감지
      setEdges(layoutedEdges); // 새로운 배열로 전달하여 변경 감지

      // requestAnimationFrame을 사용하여 다음 렌더링 프레임에서 실행 보장
      requestAnimationFrame(() => {
        // layoutedNodes를 사용하여 노드 내부 상태 업데이트
        layoutedNodes.forEach((n) => updateNodeInternals(n.id));
        // 레이아웃 변경 후 fitView 적용
        reactFlowInstance.current?.fitView({ padding: 0.2, duration: 200 }); // 부드러운 전환 효과
      });
    },
    [nodes, edges, setNodes, setEdges, updateNodeInternals] // 의존성 배열
  );

  // 줌 레벨 변경 핸들러 (슬라이더)
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoomLevel(newZoom); // 줌 레벨 상태 업데이트
    zoomTo(newZoom, { duration: 200 }); // 부드럽게 줌 변경
  };

  // defaultEdgeOptions 객체도 렌더링 시마다 재생성될 수 있으므로 useMemo 사용
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'start-end', // 기본 엣지 타입을 커스텀 엣지로 설정
      labelStyle: { fill: '#333', fontSize: 12 }, // 기본 레이블 스타일
      labelBgStyle: { fill: '#fff', borderRadius: 2 }, // 기본 레이블 배경 스타일
      labelBgPadding: [4, 4] as [number, number], // 기본 레이블 배경 패딩
      labelBgBorderRadius: 2, // 기본 레이블 배경 모서리 둥글기
      markerEnd: {
        // 기본 끝점 마커 (화살표)
        type: MarkerType.ArrowClosed,
        color: '#4a5568', // 기본 마커 색상
        width: 16,
        height: 16,
      },
    }),
    []
  ); // 의존성 배열이 비어 있으므로 컴포넌트 마운트 시 한 번만 생성됨

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange} // 노드 변경 이벤트 핸들러
      onEdgesChange={onEdgesChange} // 엣지 변경 이벤트 핸들러
      // nodeTypes와 edgeTypes는 이미 외부에서 정의되어 안정적입니다.
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView // 초기 렌더링 시 콘텐츠에 맞게 뷰 조정
      attributionPosition="bottom-right" // React Flow 로고 위치
      // useMemo로 메모이제이션된 defaultEdgeOptions 사용
      defaultEdgeOptions={defaultEdgeOptions}
      data-direction={layoutDirection} // 현재 레이아웃 방향을 DOM 속성으로 전달 (CustomEdge에서 사용)
      onInit={(instance) => {
        // React Flow 인스턴스 초기화 시
        reactFlowInstance.current = instance; // 인스턴스 참조 저장
      }}
      // proOptions={{ hideAttribution: true }} // Pro 구독 시 로고 숨기기
    >
      <Controls /> {/* 확대/축소, fitView 버튼 컨트롤 */}
      <MiniMap /> {/* 미니맵 */}
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />{' '}
      {/* 배경 (점 패턴) */}
      {/* 레이아웃 및 줌 컨트롤 패널 */}
      <Panel position="top-right">
        <div className="flex flex-col gap-2 p-2 bg-white rounded shadow-md">
          {/* 레이아웃 방향 토글 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => handleLayout('LR')}
              className={`px-4 py-2 rounded text-sm ${
                layoutDirection === 'LR'
                  ? 'bg-blue-500 text-white' // 활성 상태 스타일
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // 비활성 상태 스타일
              }`}
            >
              가로 정렬 (LR)
            </button>
            <button
              onClick={() => handleLayout('TB')}
              className={`px-4 py-2 rounded text-sm ${
                layoutDirection === 'TB'
                  ? 'bg-green-500 text-white' // 활성 상태 스타일
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // 비활성 상태 스타일
              }`}
            >
              세로 정렬 (TB)
            </button>
          </div>
          {/* 줌 컨트롤 슬라이더 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">확대/축소:</span>
            <input
              type="range" // 범위 슬라이더
              min="0.1" // 최소 줌
              max="2" // 최대 줌
              step="0.05" // 단계
              value={zoomLevel}
              onChange={handleZoomChange}
              className="w-32"
            />
            <span className="text-sm text-gray-600 w-10 text-right">
              {Math.round(zoomLevel * 100)}% {/* 현재 줌 레벨 표시 */}
            </span>
          </div>
        </div>
      </Panel>
    </ReactFlow>
  );
}
