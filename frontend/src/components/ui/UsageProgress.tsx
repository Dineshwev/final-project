import React from 'react';

interface UsageProgressProps {
  current: number;
  limit: number;
  type: string;
  className?: string;
}

const UsageProgress: React.FC<UsageProgressProps> = ({
  current,
  limit,
  type,
  className = ''
}) => {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {type} Usage ({current}/{limit})
        </span>
        <span className={`font-medium ${
          isOverLimit ? 'text-red-600 dark:text-red-400' :
          isNearLimit ? 'text-amber-600 dark:text-amber-400' :
          'text-green-600 dark:text-green-400'
        }`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isOverLimit ? 'bg-gradient-to-r from-red-500 to-red-600' :
            isNearLimit ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
            'bg-gradient-to-r from-green-500 to-green-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default UsageProgress;