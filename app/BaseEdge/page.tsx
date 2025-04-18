'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';

import CustomEdge from './CustomEdge';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'a', position: { x: 0, y: 0 }, data: { label: 'Node A' } },
  { id: 'b', position: { x: 0, y: 100 }, data: { label: 'Node B' } },
  { id: 'c', position: { x: 0, y: 200 }, data: { label: 'Node C' } },
];

const initialEdges = [
  { id: 'a->b', type: 'custom-edge', source: 'a', target: 'b' },
  { id: 'b->c', type: 'custom-edge', source: 'b', target: 'c' },
];

const edgeTypes = {
  'custom-edge': CustomEdge,
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: 'custom-edge' };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        fitView
        edgeTypes={edgeTypes}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;
