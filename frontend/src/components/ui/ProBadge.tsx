import React from 'react';

interface ProBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

const ProBadge: React.FC<ProBadgeProps> = ({ className = '', size = 'sm' }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm';
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] rounded',
    md: 'px-2 py-0.5 text-xs rounded-md'
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      PRO
    </span>
  );
};

export default ProBadge;