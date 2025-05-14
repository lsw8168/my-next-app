'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ExpandedState,
  createColumnHelper,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';

export interface TableNode {
  id: number;
  name: string;
  description?: string;
  type?: string;
  children?: TableNode[];
}

interface ColumnMeta {
  rowSpan?: number;
}

interface HierarchyTableProps {
  data: TableNode[];
}

const HierarchyTable: React.FC<HierarchyTableProps> = ({ data }) => {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const [sorting, setSorting] = React.useState<SortingState>([]);

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

  const columnHelper = createColumnHelper<TableNode>();

  // 컬럼 정의
  const columns = [
    columnHelper.group({
      id: 'hello',
      header: 'Hello',
      columns: [
        {
          accessorKey: 'name',
          header: '이름',
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
      ],
    }),
    columnHelper.group({
      id: 'info',
      header: 'Info',
      columns: [
        {
          accessorKey: 'description',
          header: '설명',
        },
      ],
    }),
    columnHelper.accessor('type', {
      id: 'type',
      header: '유형',
      cell: (type) => type.getValue(),
      meta: {
        rowSpan: 2,
      },
    }),
  ];

  // 테이블 생성
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => String(row.id),
    state: {
      expanded,
      sorting,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
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
      <div style={{ padding: '10px', display: 'flex', gap: '8px' }}>
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
      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          fontFamily: 'Arial, sans-serif',
          border: '1px solid #e0e0e0',
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const rowSpan = (header.column.columnDef.meta as ColumnMeta)
                  ?.rowSpan;

                if (
                  !header.isPlaceholder &&
                  rowSpan !== undefined &&
                  header.id === header.column.id
                ) {
                  return null;
                }

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    rowSpan={rowSpan}
                    style={{
                      border: '1px solid #e0e0e0',
                      textAlign: 'left',
                      padding: '12px 16px',
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#333',
                    }}
                  >
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sort ascending'
                            : header.column.getNextSortingOrder() === 'desc'
                            ? 'Sort descending'
                            : 'Clear sort'
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                );
              })}
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
                    border: '1px solid #e0e0e0',
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
