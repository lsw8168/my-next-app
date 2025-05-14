'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  ExpandedState,
  createColumnHelper,
} from '@tanstack/react-table';

export interface TableNode {
  id: number;
  name: string;
  description?: string;
  type?: string;
  children?: TableNode[];
}

interface HierarchyTableProps {
  data: TableNode[];
}

const HierarchyTable: React.FC<HierarchyTableProps> = ({ data }) => {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // 모두 펼치기
  const handleExpandAll = React.useCallback(() => {
    const newExpanded: ExpandedState = {};

    const expandRows = (nodes: TableNode[]) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          newExpanded[node.id] = true;
          expandRows(node.children);
        }
      });
    };

    expandRows(data);
    setExpanded(newExpanded);
  }, [data]);

  // 모두 접기
  const handleCollapseAll = React.useCallback(() => {
    setExpanded({});
  }, []);

  const columnHelper = createColumnHelper<TableNode[]>();

  // 컬럼 정의
  const columns = React.useMemo<ColumnDef<TableNode>[]>(
    () => [
      {
        accessorKey: 'name',
        header: () => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>이름</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleExpandAll}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                모두 펼치기
              </button>
              <button
                onClick={handleCollapseAll}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                모두 접기
              </button>
            </div>
          </div>
        ),
        cell: ({ row, getValue }) => {
          const hasChildren = row.original.children?.length;
          return (
            <div style={{ paddingLeft: `${row.depth * 20}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => row.toggleExpanded()}
                  style={{
                    marginRight: '8px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    width: '20px',
                    height: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                >
                  {row.getIsExpanded() ? '-' : '+'}
                </button>
              ) : null}
              {getValue() as string}
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: '설명',
      },
      {
        accessorKey: 'type',
        header: '유형',
      },
    ],
    [handleCollapseAll, handleExpandAll]
  );

  // 테이블 생성
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    autoResetExpanded: false,
  });

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: '10px',
      }}
    >
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    borderBottom: '1px solid #e0e0e0',
                    textAlign: 'left',
                    padding: '12px 16px',
                    backgroundColor: '#f8f9fa',
                    fontWeight: '600',
                    color: '#333',
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              style={{
                borderBottom: '1px solid #e0e0e0',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '12px 16px',
                    color: '#333',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HierarchyTable;
