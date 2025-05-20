import React from 'react';

export const PendingComponent: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export const ErrorComponent: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-full text-red-500">
    <p>데이터를 불러오는 중 오류가 발생했습니다: {message}</p>
  </div>
);
