'use client';

import { faker } from '@faker-js/faker';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnResizeMode,
} from '@tanstack/react-table';
import { useState, useMemo, useEffect } from 'react';

import './index.css';

export type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  progress: number;
  status: 'relationship' | 'complicated' | 'single';
  subRows?: Person[];
};

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (): Person => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int(40),
    visits: faker.number.int(1000),
    progress: faker.number.int(100),
    status: faker.helpers.shuffle<Person['status']>([
      'relationship',
      'complicated',
      'single',
    ])[0]!,
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Person[] => {
    const len = lens[depth]!;
    return range(len).map((): Person => {
      return {
        ...newPerson(),
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
      };
    });
  };

  return makeDataLevel();
}

export default function Table2() {
  const [data, setData] = useState<Person[]>([]);
  const columnResizeMode: ColumnResizeMode = 'onChange';

  useEffect(() => {
    setData(makeData(100));
  }, []);

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        header: '이름',
        accessorKey: 'firstName',
        size: 1000,
        minSize: 200,
      },
      {
        header: '성',
        accessorKey: 'lastName',
        size: 500,
        minSize: 200,
      },
      {
        header: '나이',
        accessorKey: 'age',
        size: 150,
      },
      {
        header: '방문 횟수',
        accessorKey: 'visits',
        size: 500,
      },
      {
        header: '진행률',
        accessorKey: 'progress',
        size: 100,
      },
      {
        header: '상태',
        accessorKey: 'status',
        size: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode,
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
    },
  });

  return (
    <div className="p-2">
      <table className="border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border p-2 text-left bg-gray-100 relative"
                  style={{ width: header.getSize() }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none ${
                      header.column.getIsResizing()
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border p-2"
                  style={{ width: cell.column.getSize() }}
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
}
