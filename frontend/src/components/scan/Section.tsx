import React, { useState } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  initiallyOpen?: boolean;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, description, initiallyOpen = true, children }) => {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <div className="bg-white rounded-2xl shadow">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
        <div className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
        </div>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

export default Section;
