import React from 'react';
import { Node } from '@xyflow/react';

interface NodeDetailDrawerProps {
  isOpen: boolean;
  selectedNode: Node | null;
  onClose: () => void;
}

const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  isOpen,
  selectedNode,
  onClose,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">노드 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {selectedNode && (
          <div>
            <p className="mb-2">
              <strong>ID:</strong> {selectedNode.id}
            </p>
            <p className="mb-2">
              <strong>타입:</strong> {selectedNode.type}
            </p>
            <p className="mb-2">
              <strong>데이터:</strong>
            </p>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(selectedNode.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetailDrawer;
