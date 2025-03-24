
import React from "react";

interface NoDataDisplayProps {
  message?: string;
}

export const NoDataDisplay = ({ message = "No data available. Please select dimensions and metrics." }: NoDataDisplayProps) => {
  return (
    <div className="h-64 flex items-center justify-center border rounded p-4 bg-gray-50 dark:bg-gray-800">
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};
