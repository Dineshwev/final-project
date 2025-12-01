import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradientFrom?: string; // e.g. 'from-white'
  gradientTo?: string;   // e.g. 'to-blue-50'
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradientFrom = 'from-white', gradientTo = 'to-blue-50' }) => {
  return (
    <div className={`group flex flex-col items-center text-center p-8 bg-gradient-to-b ${gradientFrom} ${gradientTo} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1`}>
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-full mb-6 text-white transform transition-transform duration-300 group-hover:scale-110 shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
