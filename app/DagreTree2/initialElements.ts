import { MarkerType } from '@xyflow/react';

const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';

const test = {
  explanation: 1,
  explanationInfo: '',
  fileNodes: [
    {
      actedThreatScore: 0,
      actedType: 106,
      actorNodeUid: 3002253595,
      actorProcessSha256:
        'be8718451ebfab63f682b8a7108e159c94ac072ddd12179908413a72868c629b',
      eventTime: 133884833652250591,
      isBlocked: 'true',
      isProcessed: 'false',
      nodeThreatScore: 100,
      nodeUid: 1643081024,
      originalPath: '',
      path: 'C:\\Users\\Administrator\\Desktop\\default\\ALZip1207.exe',
      sha256:
        'a8393387d8f026cfcc274da1fe4d12c69523fb3739d94abecfa483dc4f0b8132',
      size: 23184504,
    },
    {
      actedThreatScore: 0,
      actedType: 106,
      actorNodeUid: 3002253595,
      actorProcessSha256:
        'be8718451ebfab63f682b8a7108e159c94ac072ddd12179908413a72868c629b',
      eventTime: 133884833652155007,
      isProcessed: 'false',
      nodeThreatScore: 100,
      nodeUid: 360404611,
      originalPath: '',
      path: 'C:\\Users\\Administrator\\Desktop\\default\\ALZip1207.exe',
      sha256:
        'a8393387d8f026cfcc274da1fe4d12c69523fb3739d94abecfa483dc4f0b8132',
      size: 23184504,
    },
    {
      actedThreatScore: 0,
      actedType: 106,
      actorNodeUid: 3002253595,
      actorProcessSha256:
        'be8718451ebfab63f682b8a7108e159c94ac072ddd12179908413a72868c629b',
      eventTime: 133884833652229603,
      isProcessed: 'false',
      nodeThreatScore: 100,
      nodeUid: 224626719,
      originalPath: '',
      path: 'C:\\Users\\Administrator\\Desktop\\default\\ALZip1207.exe',
      sha256:
        'a8393387d8f026cfcc274da1fe4d12c69523fb3739d94abecfa483dc4f0b8132',
      size: 23184504,
    },
    {
      actedThreatScore: 0,
      actedType: 106,
      actorNodeUid: 3002253595,
      actorProcessSha256:
        'be8718451ebfab63f682b8a7108e159c94ac072ddd12179908413a72868c629b',
      eventTime: 133884833652244262,
      isProcessed: 'false',
      nodeThreatScore: 100,
      nodeUid: 4049730864,
      originalPath: '',
      path: 'C:\\Users\\Administrator\\Desktop\\default\\ALZip1207.exe',
      sha256:
        'a8393387d8f026cfcc274da1fe4d12c69523fb3739d94abecfa483dc4f0b8132',
      size: 23184504,
    },
    {
      actedThreatScore: 0,
      actedType: 106,
      actorNodeUid: 3002253595,
      actorProcessSha256:
        'be8718451ebfab63f682b8a7108e159c94ac072ddd12179908413a72868c629b',
      eventTime: 133884833652393638,
      isProcessed: 'false',
      nodeThreatScore: 100,
      nodeUid: 3836308470,
      originalPath: '',
      path: 'C:\\Users\\Administrator\\Desktop\\default\\ALZip1207.exe',
      sha256:
        'a8393387d8f026cfcc274da1fe4d12c69523fb3739d94abecfa483dc4f0b8132',
      size: 23184504,
    },
  ],
  libraryNodes: [],
  networkNodes: [],
  processNodes: [
    {
      actedThreatScore: 0,
      actedType: 1,
      actorNodeUid: 2336868373,
      actorProcessSha256: '',
      commandLine: '"C:\\Program Files\\ESTsoft\\ALYac\\AYCRTSrv.ayc"',
      eventTime: 133884791201176412,
      isProcessed: 'false',
      nodeThreatScore: 0,
      nodeUid: 3002253595,
      path: 'C:\\Program Files\\ESTsoft\\ALYac\\AYCRTSrv.ayc',
      processId: 4644,
      sha256:
        'be8718451ebfab63f682b8a7108e159c94ac072ddd12179908413a72868c629b',
      size: 746872,
    },
    {
      actedThreatScore: 0,
      actedType: 1,
      actorNodeUid: 0,
      actorProcessSha256: '',
      commandLine: 'C:\\Windows\\system32\\services.exe',
      eventTime: 0,
      isProcessed: 'false',
      nodeThreatScore: 0,
      nodeUid: 2336868373,
      path: '',
      processId: 664,
      sha256: '',
      size: 0,
    },
  ],
  registryNodes: [],
};

export const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input' },
    position,
  },
  {
    id: '2',
    data: { label: 'node 2' },
    position,
  },
  {
    id: '2a',
    data: { label: 'node 2a' },
    position,
  },
  {
    id: '2b',
    data: { label: 'node 2b' },
    position,
  },
  {
    id: '2c',
    data: { label: 'node 2c' },
    position,
  },
  {
    id: '2d',
    data: { label: 'node 2d' },
    position,
  },
  {
    id: '3',
    data: { label: 'node 3' },
    position,
  },
  {
    id: '4',
    data: { label: 'node 4' },
    position,
  },
  {
    id: '5',
    data: { label: 'node 5' },
    position,
  },
  {
    id: '6',
    type: 'output',
    data: { label: 'output' },
    position,
  },
  { id: '7', type: 'output', data: { label: 'output' }, position },
];

export const initialEdges = [
  { id: 'e12', source: '1', target: '2', type: edgeType, animated: false },
  { id: 'e13', source: '1', target: '3', type: edgeType, animated: true },
  { id: 'e22a', source: '2', target: '2a', type: edgeType, animated: true },
  { id: 'e22b', source: '2', target: '2b', type: edgeType, animated: true },
  { id: 'e22c', source: '2', target: '2c', type: edgeType, animated: true },
  {
    id: 'e2c2d',
    source: '2c',
    target: '2d',
    type: edgeType,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#FF0072',
    },
    style: {
      strokeWidth: 2,
      stroke: '#FF0072',
    },
    label: 'marker size and color',
  },
  { id: 'e45', source: '4', target: '5', type: edgeType, animated: true },
  { id: 'e56', source: '5', target: '6', type: edgeType, animated: true },
  { id: 'e57', source: '5', target: '7', type: edgeType, animated: true },
];
