import React from 'react';
import HierarchyTable, { TableNode } from './components/HierarchyTable';

const sampleData: TableNode[] = [
  {
    id: 1,
    name: 'Parent 1',
    children: [
      { id: 2, name: 'Child 1.1' },
      { id: 3, name: 'Child 1.2' },
    ],
  },
  {
    id: 4,
    name: 'Parent 2',
    children: [
      {
        id: 5,
        name: 'Child 2.1',
        children: [{ id: 6, name: 'GrandChild 2.1.1' }],
      },
      { id: 7, name: 'Child 2.2' },
    ],
  },
];

function App() {
  return (
    <div>
      <h1>Expandable Hierarchy Table</h1>
      <HierarchyTable data={sampleData} />
    </div>
  );
}

export default App;
