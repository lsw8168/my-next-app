'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useStoreApi,
  useReactFlow,
  Node,
  InternalNode,
  SelectionMode,
  Controls,
  MiniMap,
  Edge,
  MarkerType,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import TooltipNode from './TooltipNode';
import CustomEdge from './CustomEdge';
import CustomEdgeStartEnd from './CustomEdgeStartEnd';

import { initialEdges, initialNodes } from './initialElements';
import { DevTools } from './Devtools';

const MIN_DISTANCE = 150;

interface ProximityEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  className?: string;
}

interface CustomEdge extends Edge {
  sourceHandle: string;
  targetHandle: string;
  animated: boolean;
  style?: Record<string, string | number>;
  label?: string;
  labelBgStyle?: Record<string, string | number>;
  markerEnd?: {
    type: MarkerType;
    width: number;
    height: number;
    color: string;
  };
  className?: string;
}

// 엣지 스타일 정의
const edgeStyles = {
  stroke: '#333',
  strokeWidth: 2,
};

// 임시 엣지 스타일
const tempEdgeStyles = {
  stroke: '#999',
  strokeWidth: 2,
  strokeDasharray: '5 5',
};

// 노드 타입별 컴포넌트 매핑
const nodeTypes = {
  custom: TooltipNode,
};

const edgeTypes = {
  default: CustomEdge,
  'start-end': CustomEdgeStartEnd,
};

const Flow = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const store = useStoreApi();
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
        const nextEdges = es.filter(
          (e) => !('className' in e) || e.className !== 'temp'
        );

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
        const nextEdges = es.filter(
          (e) => !('className' in e) || e.className !== 'temp'
        );

        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          const newEdge: CustomEdge = {
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        selectionMode={SelectionMode.Partial}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
        <DevTools position="top-left" />
      </ReactFlow>
    </div>
  );
};

const FlowWithProvider = () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);

export default FlowWithProvider;
