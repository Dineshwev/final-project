import React, { ReactNode } from 'react';

// This is a wrapper component to fix the TypeScript error with React Icons in React 19
// The error is: 'Icon' cannot be used as a JSX component. Its return type 'ReactNode' is not a valid JSX element.

interface IconWrapperProps {
  icon: ReactNode;
  className?: string;
  size?: number;
  title?: string;
  onClick?: () => void;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon, className, size, onClick, title }) => {
  return (
    <span 
      className={className} 
      style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
      onClick={onClick}
      title={title}
    >
      {icon}
    </span>
  );
};

export default IconWrapper;