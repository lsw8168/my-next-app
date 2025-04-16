import React, { useState } from 'react';
import { NodeProps, Position, Handle, NodeToolbar } from '@xyflow/react';
import {
  FaUser,
  FaHome,
  FaBuilding,
  FaCog,
  FaBookmark,
  FaEnvelope,
  FaPhone,
  FaStar,
} from 'react-icons/fa';

const TooltipNode = ({
  data,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const label = data?.label as string | undefined;
  const iconName = data?.iconName as string | undefined;
  const description = data?.description as string | undefined;

  const iconMap = {
    user: FaUser,
    home: FaHome,
    building: FaBuilding,
    cog: FaCog,
    bookmark: FaBookmark,
    envelope: FaEnvelope,
    phone: FaPhone,
    star: FaStar,
  };

  const renderIcon = () => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || FaUser;
    return (
      <IconComponent
        className={`w-[18px] h-[18px] ${
          selected ? 'text-blue-500' : 'text-gray-800'
        }`}
      />
    );
  };

  return (
    <>
      <NodeToolbar
        isVisible={isHovered}
        position={Position.Top}
        className="bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
      >
        {description}
      </NodeToolbar>
      <div
        className={`custom-node flex flex-col items-center justify-center gap-2 p-3 ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {targetPosition && (
          <Handle
            id="target"
            type="target"
            position={targetPosition}
            className="connectionindicator"
          />
        )}
        <div className="mt-1">{renderIcon()}</div>
        <div className="font-medium">{label}</div>
        {sourcePosition && (
          <Handle
            id="source"
            type="source"
            position={sourcePosition}
            className="connectionindicator"
          />
        )}
      </div>
    </>
  );
};

export default TooltipNode;
