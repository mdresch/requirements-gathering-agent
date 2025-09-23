import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100, 
  className = '', 
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

