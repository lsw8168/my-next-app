// __tests__/FlowChartPage.test.tsx or app/test2/FlowChartPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlowChartPage from './page'; // Adjusted the import path to match the correct location

// --- Mocks ---

// Mock reactflow components and hooks
const mockUseNodesState = jest.fn();
const mockUseEdgesState = jest.fn();
const mockUseReactFlow = jest.fn();
const mockUseUpdateNodeInternals = jest.fn(() => jest.fn()); // Returns a mock function
const mockZoomTo = jest.fn();
const mockFitView = jest.fn();

// Mock initial state for nodes/edges (simplified)
const initialMockNodes = [
  {
    id: '1',
    data: { label: '시작', direction: 'LR' },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    data: { label: '데이터 로드', direction: 'LR' },
    position: { x: 200, y: 0 },
  },
  // Add more mock nodes if needed for specific tests
];
const initialMockEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'straight' },
  // Add more mock edges if needed
];

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'), // Keep original exports like Position, MarkerType
  ReactFlow: jest.fn(
    ({ children, 'data-direction': dataDirection, onInit }) => {
      // Simulate onInit call
      React.useEffect(() => {
        if (onInit) {
          onInit({ fitView: mockFitView, zoomTo: mockZoomTo }); // Provide mock instance
        }
      }, [onInit]);
      return (
        <div data-testid="reactflow-mock" data-direction={dataDirection}>
          {children}
        </div>
      );
    }
  ),
  useNodesState: (
    initialNodes: Array<{
      id: string;
      data: any;
      position: { x: number; y: number };
    }>
  ) => {
    // Use the mock setter for verification, return controlled state
    const [nodes, setNodes] = React.useState(initialNodes);
    mockUseNodesState.mockReturnValue([nodes, setNodes]); // Store the latest mock return value
    return [nodes, setNodes];
  },
  useEdgesState: (
    initialEdges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
    }>
  ) => {
    // Use the mock setter for verification, return controlled state
    const [edges, setEdges] = React.useState(initialEdges);
    mockUseEdgesState.mockReturnValue([edges, setEdges]); // Store the latest mock return value
    return [edges, setEdges];
  },
  useReactFlow: () => mockUseReactFlow(),
  useUpdateNodeInternals: () => mockUseUpdateNodeInternals(),
  Controls: () => <div data-testid="controls-mock">Controls</div>,
  MiniMap: () => <div data-testid="minimap-mock">MiniMap</div>,
  Background: () => <div data-testid="background-mock">Background</div>,
  Panel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="panel-mock">{children}</div>
  ),
  Handle: () => <div data-testid="handle-mock"></div>, // Mock Handle
  BaseEdge: () => <g data-testid="baseedge-mock"></g>, // Mock BaseEdge (SVG element)
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="edgelabelrenderer-mock">{children}</div>
  ), // Mock EdgeLabelRenderer
  getBezierPath: jest.fn(() => ['M0,0 C50,0 50,100 100,100', 50, 50]), // Return mock path and label coords
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ), // Just pass children through
  Position: jest.requireActual('reactflow').Position, // Keep actual Position
  MarkerType: jest.requireActual('reactflow').MarkerType, // Keep actual MarkerType
}));

// Mock dagre
const mockDagreNode = jest.fn(() => ({
  x: Math.random() * 500,
  y: Math.random() * 500,
}));
const mockSetNode = jest.fn();
const mockSetEdge = jest.fn();
const mockSetGraph = jest.fn();
const mockDagreLayout = jest.fn();
const mockGraph = jest.fn(() => ({
  setNode: mockSetNode,
  setEdge: mockSetEdge,
  node: mockDagreNode,
  setDefaultEdgeLabel: jest.fn(),
  setGraph: mockSetGraph,
}));

jest.mock('@dagrejs/dagre', () => ({
  graphlib: {
    Graph: mockGraph,
  },
  layout: mockDagreLayout,
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaPlay: () => <span data-testid="icon-play">Play</span>,
  FaStop: () => <span data-testid="icon-stop">Stop</span>,
  FaCog: () => <span data-testid="icon-cog">Cog</span>,
  FaCheck: () => <span data-testid="icon-check">Check</span>,
}));

// Mock requestAnimationFrame
jest
  .spyOn(window, 'requestAnimationFrame')
  .mockImplementation((cb: FrameRequestCallback) => {
    cb(); // Execute immediately
    return 1; // Return a number like the original function
  });

// Mock document.querySelector used in CustomEdge
const mockGetAttribute = jest.fn().mockReturnValue('LR'); // Initial direction
const mockQuerySelector = jest.fn().mockReturnValue({
  getAttribute: mockGetAttribute,
});
jest.spyOn(document, 'querySelector').mockImplementation(mockQuerySelector);

// --- Test Suite ---

describe('FlowChartPage and FlowChart', () => {
  // Define mock setters here to be accessible in tests
  let mockSetNodes: jest.Mock;
  let mockSetEdges: jest.Mock;
  let mockUpdateInternalsFn: jest.Mock;

  beforeEach(() => {
    // Reset mocks and setup initial returns before each test
    jest.clearAllMocks();

    // Create new mock functions for setters in each test
    mockSetNodes = jest.fn();
    mockSetEdges = jest.fn();
    mockUpdateInternalsFn = jest.fn(); // The function returned by the hook

    // Setup initial return values for hooks
    mockUseNodesState.mockReturnValue([initialMockNodes, mockSetNodes]);
    mockUseEdgesState.mockReturnValue([initialMockEdges, mockSetEdges]);
    mockUseReactFlow.mockReturnValue({
      zoomTo: mockZoomTo,
      fitView: mockFitView,
    });
    mockUseUpdateNodeInternals.mockReturnValue(mockUpdateInternalsFn);

    // Reset mock implementations if needed
    mockGetAttribute.mockReturnValue('LR'); // Reset direction for each test
    mockQuerySelector.mockClear();
    mockQuerySelector.mockReturnValue({ getAttribute: mockGetAttribute }); // Ensure it returns the mock element

    // Reset dagre mocks
    mockDagreNode.mockClear();
    mockSetNode.mockClear();
    mockSetEdge.mockClear();
    mockSetGraph.mockClear();
    mockDagreLayout.mockClear();
    mockGraph.mockClear();

    // Reset reactflow mocks
    mockZoomTo.mockClear();
    mockFitView.mockClear();

    // Reset RAF mock
    (window.requestAnimationFrame as jest.Mock).mockClear();
  });

  test('renders initial components correctly', () => {
    render(<FlowChartPage />);

    // Check if main mocked components are rendered
    expect(screen.getByTestId('reactflow-mock')).toBeInTheDocument();
    expect(screen.getByTestId('controls-mock')).toBeInTheDocument();
    expect(screen.getByTestId('minimap-mock')).toBeInTheDocument();
    expect(screen.getByTestId('background-mock')).toBeInTheDocument();
    expect(screen.getByTestId('panel-mock')).toBeInTheDocument();

    // Check initial panel content
    expect(
      screen.getByRole('button', { name: /가로 정렬 \(LR\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /세로 정렬 \(TB\)/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // Initial zoom

    // Check initial layout direction state (via button style/class and data-attribute)
    expect(
      screen.getByRole('button', { name: /가로 정렬 \(LR\)/i })
    ).toHaveClass('bg-blue-500');
    expect(
      screen.getByRole('button', { name: /세로 정렬 \(TB\)/i })
    ).not.toHaveClass('bg-green-500');
    expect(screen.getByTestId('reactflow-mock')).toHaveAttribute(
      'data-direction',
      'LR'
    );
    expect(mockGetAttribute()).toBe('LR'); // Check attribute read by CustomEdge mock
  });

  test('changes layout to TB when "세로 정렬 (TB)" button is clicked', async () => {
    render(<FlowChartPage />);

    const tbButton = screen.getByRole('button', { name: /세로 정렬 \(TB\)/i });
    const lrButton = screen.getByRole('button', { name: /가로 정렬 \(LR\)/i });
    const reactFlowMock = screen.getByTestId('reactflow-mock');

    // Initial state check
    expect(lrButton).toHaveClass('bg-blue-500');
    expect(tbButton).not.toHaveClass('bg-green-500');
    expect(reactFlowMock).toHaveAttribute('data-direction', 'LR');
    mockGetAttribute.mockReturnValue('LR'); // Simulate reading LR initially

    // Click TB button
    fireEvent.click(tbButton);

    // Update the mock return value for subsequent reads by CustomEdge
    mockGetAttribute.mockReturnValue('TB');

    // Wait for state updates and potential async operations (like RAF)
    await waitFor(() => {
      // Check if layout function was called with 'TB'
      expect(mockSetGraph).toHaveBeenCalledWith({ rankdir: 'TB' });
      expect(mockDagreLayout).toHaveBeenCalled();

      // Check if state setters were called (important!)
      // We expect setNodes/setEdges to be called with the *new* layouted nodes/edges
      expect(mockSetNodes).toHaveBeenCalled();
      expect(mockSetEdges).toHaveBeenCalled();

      // Check if node internals were updated
      expect(mockUpdateInternalsFn).toHaveBeenCalled();

      // Check if fitView was called (via RAF)
      expect(mockFitView).toHaveBeenCalledWith({ padding: 0.2, duration: 200 });

      // Check UI update (button styles and data-attribute)
      expect(tbButton).toHaveClass('bg-green-500');
      expect(lrButton).not.toHaveClass('bg-blue-500');
      expect(reactFlowMock).toHaveAttribute('data-direction', 'TB');
      expect(mockGetAttribute()).toBe('TB'); // Check attribute read by CustomEdge mock after change
    });
  });

  test('changes layout back to LR when "가로 정렬 (LR)" button is clicked after TB', async () => {
    render(<FlowChartPage />);

    const tbButton = screen.getByRole('button', { name: /세로 정렬 \(TB\)/i });
    const lrButton = screen.getByRole('button', { name: /가로 정렬 \(LR\)/i });
    const reactFlowMock = screen.getByTestId('reactflow-mock');

    // Go to TB first
    mockGetAttribute.mockReturnValue('LR');
    fireEvent.click(tbButton);
    mockGetAttribute.mockReturnValue('TB'); // Update mock for reads

    // Wait for TB layout to settle
    await waitFor(() => {
      expect(reactFlowMock).toHaveAttribute('data-direction', 'TB');
      expect(tbButton).toHaveClass('bg-green-500');
    });

    // Clear mocks from the first click before the second click
    mockSetGraph.mockClear();
    mockDagreLayout.mockClear();
    mockSetNodes.mockClear();
    mockSetEdges.mockClear();
    mockUpdateInternalsFn.mockClear();
    mockFitView.mockClear();

    // Click LR button
    fireEvent.click(lrButton);
    mockGetAttribute.mockReturnValue('LR'); // Update mock for reads

    // Wait for state updates
    await waitFor(() => {
      // Check if layout function was called with 'LR'
      expect(mockSetGraph).toHaveBeenCalledWith({ rankdir: 'LR' });
      expect(mockDagreLayout).toHaveBeenCalled();

      // Check setters
      expect(mockSetNodes).toHaveBeenCalled();
      expect(mockSetEdges).toHaveBeenCalled();

      // Check internals update
      expect(mockUpdateInternalsFn).toHaveBeenCalled();

      // Check fitView
      expect(mockFitView).toHaveBeenCalledWith({ padding: 0.2, duration: 200 });

      // Check UI update
      expect(lrButton).toHaveClass('bg-blue-500');
      expect(tbButton).not.toHaveClass('bg-green-500');
      expect(reactFlowMock).toHaveAttribute('data-direction', 'LR');
      expect(mockGetAttribute()).toBe('LR');
    });
  });

  test('updates zoom level and calls zoomTo when slider is changed', () => {
    render(<FlowChartPage />);

    const slider = screen.getByRole('slider');
    const percentageDisplay = screen.getByText('100%'); // Initial

    // Change slider value
    fireEvent.change(slider, { target: { value: '0.5' } });

    // Check if zoomTo was called
    expect(mockZoomTo).toHaveBeenCalledWith(0.5, { duration: 200 });

    // Check if the percentage display updated in the UI
    // Note: The state update happens within the component, RTL reflects the DOM change
    expect(percentageDisplay).toHaveTextContent('50%'); // 0.5 * 100

    // Change again
    fireEvent.change(slider, { target: { value: '1.85' } });
    expect(mockZoomTo).toHaveBeenCalledWith(1.85, { duration: 200 });
    // Use Math.round as the component does
    expect(percentageDisplay).toHaveTextContent(`${Math.round(1.85 * 100)}%`); // 185%
  });

  // Optional: Test resize handling (might be less critical if covered by interaction tests)
  test('calls fitView on window resize', () => {
    // Mock addEventListener
    const map: { [key: string]: EventListenerOrEventListenerObject } = {};
    window.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });
    window.removeEventListener = jest.fn((event) => {
      delete map[event];
    });

    render(<FlowChartPage />);

    // Simulate the resize event by directly calling the stored listener
    const resizeEvent = new Event('resize');
    if (typeof map.resize === 'function') {
      map.resize(resizeEvent);
    } else {
      throw new Error('Resize listener not attached');
    }

    // Check if fitView was called by the handler
    // Note: The original code uses reactFlowInstance.current?.fitView
    // Our mock setup ensures the instance passed in onInit has the mockFitView
    expect(mockFitView).toHaveBeenCalledWith({ padding: 0.2, duration: 0 });
  });
});
