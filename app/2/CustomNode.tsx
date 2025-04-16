import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FaUser } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface CustomNodeProps {
  data: {
    name: string;
    job: string;
    icon: React.ReactNode;
  };
  sourcePosition?: Position;
  targetPosition?: Position;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  sourcePosition,
  targetPosition,
}) => {
  console.log(data, targetPosition, sourcePosition);
  return (
    <div
      id={`node-${data.name}`}
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400"
      data-tooltip-id="custom-node-tooltip"
      data-tooltip-content={`Name: ${data.name}, Job: ${data.job}`}
    >
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
          {data.icon}
          <FaUser />
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">{data.job}</div>
        </div>
      </div>

      {targetPosition && (
        <Handle
          type="target"
          position={targetPosition}
          className="w-16 !bg-teal-500"
        />
      )}
      {sourcePosition && (
        <Handle
          type="source"
          position={sourcePosition}
          className="w-16 !bg-teal-500"
        />
      )}
      <Tooltip id="custom-node-tooltip" />
    </div>
  );
};

export default CustomNode;
