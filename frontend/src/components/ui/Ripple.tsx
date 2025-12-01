import React, { useRef } from 'react';

interface RippleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  colorClass?: string; // tailwind text/background color for ripple
}

export const Ripple: React.FC<RippleProps> = ({ children, colorClass = 'bg-white/40', className = '', ...rest }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const onClick = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.borderRadius = '9999px';
    ripple.style.pointerEvents = 'none';
    ripple.className = `animate-ripple ${colorClass}`;
    el.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 700);
  };

  return (
    <div ref={containerRef} onClick={onClick} className={`relative overflow-hidden ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Ripple;
