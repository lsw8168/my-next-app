// CustomMiniMap 컴포넌트

import { MiniMap, MiniMapProps, Node } from '@xyflow/react';
import { CSSProperties } from 'react';

interface CustomMiniMapNodeProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  className: string;
  color?: string;
  shapeRendering: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  selected: boolean;
  onClick?: (event: React.MouseEvent, id: string) => void;
}

interface CustomMiniMapProps extends Omit<MiniMapProps, 'nodeComponent'> {
  nodes: Node[];
}

const CustomMiniMap = ({ nodes, ...props }: CustomMiniMapProps) => {
  const nodeComponent = (props: CustomMiniMapNodeProps) => {
    const { x, y, width, height, style, id } = props;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const r = 30;

    const node = nodes.find((n) => n.id === id);
    let fillColor = '#888';

    if (node) {
      if (node.type === 'input') {
        fillColor = '#0041d0';
      } else if (node.type === 'output') {
        fillColor = '#ff0072';
      } else if (node.type === 'default') {
        fillColor = '#1a192b';
      }
    }

    return (
      <circle cx={cx} cy={cy} r={r} style={{ ...style, fill: fillColor }} />
    );
  };

  return <MiniMap {...props} nodeComponent={nodeComponent} />;
};

export default CustomMiniMap;
