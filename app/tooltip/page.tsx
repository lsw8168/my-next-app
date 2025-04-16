'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useStoreApi,
  useReactFlow,
  Node,
  Edge,
  Connection,
  InternalNode,
  NodeTypes,
  MarkerType,
  SelectionMode,
  Controls,
  MiniMap,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { initialEdges, initialNodes } from './initialElements';
import { DevTools } from './Devtools';
import TooltipNode from './TooltipNode';

const MIN_DISTANCE = 150;

interface CustomEdge extends Edge {
  className?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface ProximityEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  className?: string;
}

// 노드 타입별 컴포넌트 매핑
const nodeTypes: NodeTypes = {
  custom: TooltipNode,
};

// 엣지 스타일 정의
const edgeStyles = {
  stroke: '#333',
  strokeWidth: 2,
};

// 임시 엣지 스타일
const tempEdgeStyles = {
  stroke: '#ff0072',
  strokeWidth: 2,
  strokeDasharray: '5,5',
};

const Flow = () => {
  const store = useStoreApi();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<CustomEdge>(initialEdges);
  const { getInternalNode } = useReactFlow();

  // 디버깅을 위한 useEffect 추가
  useEffect(() => {
    console.log('노드 상태:', nodes);
  }, [nodes]);

  // 엣지 초기화 및 스타일 적용
  useEffect(() => {
    // 초기 엣지 스타일 적용
    console.log('엣지 초기화');
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      console.log('연결 파라미터:', params);

      // 이미 존재하는 연결인지 확인
      const isExistingConnection = edges.some(
        (edge) =>
          (edge.source === params.source && edge.target === params.target) ||
          (edge.source === params.target && edge.target === params.source)
      );

      // 소스 노드의 현재 연결 수 확인
      const sourceConnections = edges.filter(
        (edge) => edge.source === params.source
      ).length;

      // 최대 연결 수 제한 (예: 3개)
      const MAX_CONNECTIONS = 3;

      if (isExistingConnection) {
        console.log('이미 연결된 노드입니다.');
        return;
      }

      if (sourceConnections >= MAX_CONNECTIONS) {
        console.log('최대 연결 수를 초과했습니다.');
        return;
      }

      const newEdge: CustomEdge = {
        id: `${params.source}-${params.target}`,
        ...params,
        style: edgeStyles,
        animated: true,
        sourceHandle: params.sourceHandle || 'source',
        targetHandle: params.targetHandle || 'target',
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, edges]
  );

  const getClosestEdge = useCallback(
    (node: Node): ProximityEdge | null => {
      const { nodeLookup } = store.getState();
      const internalNode = getInternalNode(node.id);

      if (!internalNode) return null;

      const closestNode = Array.from(nodeLookup.values()).reduce<{
        distance: number;
        node: InternalNode | null;
      }>(
        (res, n) => {
          if (n.id !== internalNode.id) {
            const dx =
              n.internals.positionAbsolute.x -
              internalNode.internals.positionAbsolute.x;
            const dy =
              n.internals.positionAbsolute.y -
              internalNode.internals.positionAbsolute.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < res.distance && d < MIN_DISTANCE) {
              res.distance = d;
              res.node = n;
            }
          }

          return res;
        },
        {
          distance: Number.MAX_VALUE,
          node: null,
        }
      );

      if (!closestNode.node) {
        return null;
      }

      const closeNodeIsSource =
        closestNode.node.internals.positionAbsolute.x <
        internalNode.internals.positionAbsolute.x;

      return {
        id: closeNodeIsSource
          ? `${closestNode.node.id}-${node.id}`
          : `${node.id}-${closestNode.node.id}`,
        source: closeNodeIsSource ? closestNode.node.id : node.id,
        target: closeNodeIsSource ? node.id : closestNode.node.id,
        sourceHandle: 'source',
        targetHandle: 'target',
      };
    },
    [getInternalNode, store]
  );

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== 'temp');

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          const tempEdge: CustomEdge = {
            ...closeEdge,
            className: 'temp',
            style: tempEdgeStyles,
            animated: true,
            sourceHandle: 'source',
            targetHandle: 'target',
          };
          nextEdges.push(tempEdge);
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const closeEdge = getClosestEdge(node);

      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== 'temp');

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          const newEdge = {
            ...closeEdge,
            style: edgeStyles,
            animated: true,
            sourceHandle: 'source',
            targetHandle: 'target',
          };
          nextEdges.push(newEdge);
        }

        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        className="bg-[#F7F9FB]"
        defaultEdgeOptions={{
          style: edgeStyles,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#333',
          },
        }}
        fitView
        selectNodesOnDrag={false}
        selectionOnDrag={false}
        selectionMode={SelectionMode.Full}
        selectionKeyCode="Shift"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <DevTools position="top-left" />
      </ReactFlow>
    </div>
  );
};

const ProximityFlow = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default ProximityFlow;
