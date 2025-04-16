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

const TooltipNode = ({ data }: NodeProps) => {
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
    return <IconComponent size={18} color="#333" />;
  };

  return (
    <>
      <NodeToolbar
        isVisible={isHovered}
        position={Position.Top}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
        }}
      >
        {description}
      </NodeToolbar>
      <div
        className="custom-node"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle
          id="target"
          type="target"
          position={Position.Left}
          className="connectionindicator"
        />
        <div style={{ marginTop: '5px' }}>{renderIcon()}</div>
        <div style={{ fontWeight: '500' }}>{label}</div>
        <Handle
          id="source"
          type="source"
          position={Position.Right}
          className="connectionindicator"
        />
      </div>
    </>
  );
};

export default TooltipNode;
