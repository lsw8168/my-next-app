import React, { useState } from 'react';
import {
  NodeProps,
  Position,
  Handle,
  NodeToolbar,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
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

interface CustomEdgeData extends Record<string, unknown> {
  label?: string;
  startLabel?: string;
  endLabel?: string;
}

type FlowElementProps =
  | (NodeProps & { type: 'node' })
  | (EdgeProps<Edge<CustomEdgeData>> & { type: 'edge' });

const FlowElement: React.FC<FlowElementProps> = (props) => {
  const [isHovered, setIsHovered] = useState(false);

  // 노드 렌더링
  if (props.type === 'node') {
    const { data, selected, sourcePosition, targetPosition } = props;
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
  }

  // 엣지 렌더링
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    style,
    markerStart,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      <EdgeLabelRenderer>
        {data?.startLabel && (
          <div
            style={{
              position: 'absolute',
              background: 'transparent',
              padding: 10,
              color: '#ff5050',
              fontSize: 12,
              fontWeight: 700,
              transform: `translate(0, 0%) translate(${
                sourceX - 18
              }px, ${sourceY}px)`,
            }}
            className="nodrag nopan"
          >
            {data.startLabel}
          </div>
        )}
        {data?.endLabel && (
          <div
            style={{
              position: 'absolute',
              background: 'transparent',
              padding: 10,
              color: '#ff5050',
              fontSize: 12,
              fontWeight: 700,
              transform: `translate(0, -100%) translate(${targetX}px, ${targetY}px)`,
            }}
            className="nodrag nopan"
          >
            {data.endLabel}
          </div>
        )}
        {data?.label && (
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              position: 'absolute',
              background: 'yellow',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              pointerEvents: 'all',
            }}
            className="edge-label-renderer__custom-edge nodrag nopan"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default FlowElement;
