'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Root Node' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: { label: 'Child 1' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Child 2' },
    position: { x: 400, y: 100 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const ExpandCollapseFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const nodeId = node.id;
      const isExpanded = node.data.isExpanded;

      // 노드의 자식 노드들을 찾습니다
      const childNodes = edges
        .filter((edge) => edge.source === nodeId)
        .map((edge) => edge.target);

      if (isExpanded) {
        // 노드를 접을 때
        const nodesToRemove = nodes.filter((n) => childNodes.includes(n.id));
        const edgesToRemove = edges.filter(
          (e) => childNodes.includes(e.source) || childNodes.includes(e.target)
        );

        setNodes((nds) =>
          nds
            .filter((n) => !nodesToRemove.includes(n))
            .map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, isExpanded: false } }
                : n
            )
        );
        setEdges((eds) => eds.filter((e) => !edgesToRemove.includes(e)));
      } else {
        // 노드를 펼칠 때
        const newNodes = childNodes.map((id) => ({
          id,
          data: { label: `Child of ${nodeId}` },
          position: { x: Math.random() * 400, y: Math.random() * 400 },
        }));

        const newEdges = childNodes.map((id) => ({
          id: `e${nodeId}-${id}`,
          source: nodeId,
          target: id,
        }));

        setNodes((nds) =>
          nds
            .map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, isExpanded: true } }
                : n
            )
            .concat(newNodes)
        );
        setEdges((eds) => eds.concat(newEdges));
      }
    },
    [edges, nodes, setNodes, setEdges]
  );

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ExpandCollapseFlow;
