import { BaseEdge, type EdgeProps } from '@xyflow/react';

export default function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  const centerY = (targetY - sourceY) / 2 + sourceY;

  const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${centerY} L ${targetX} ${centerY} L ${targetX} ${targetY}`;

  return <BaseEdge id={id} path={edgePath} />;
}
