import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PlanFeature {
  name: string;
  free: boolean;
  pro: boolean;
  description?: string;
}

const features: PlanFeature[] = [
  {
    name: 'Basic SEO Analysis',
    free: true,
    pro: true,
    description: 'Core SEO metrics and basic recommendations'
  },
  {
    name: 'Site History',
    free: true,
    pro: true,
    description: 'Track changes over time (7 days for free, unlimited for PRO)'
  },
  {
    name: 'Competitor Analysis',
    free: false,
    pro: true,
    description: 'Compare your site with competitors'
  },
  {
    name: 'Link Checker',
    free: false,
    pro: true,
    description: 'Advanced link analysis and monitoring'
  },
  {
    name: 'Rank Tracking',
    free: false,
    pro: true,
    description: 'Monitor keyword rankings over time'
  },
  {
    name: 'Priority Support',
    free: false,
    pro: true,
    description: '24/7 priority email support'
  },
  {
    name: 'API Access',
    free: false,
    pro: true,
    description: 'Access to our SEO API'
  },
  {
    name: 'Custom Reports',
    free: false,
    pro: true,
    description: 'White-labeled PDF reports'
  }
];

const FeatureComparison: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                Feature
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                Free
              </th>
              <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                Pro
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {features.map((feature, i) => (
              <tr key={feature.name} className={i % 2 === 0 ? undefined : 'bg-gray-50 dark:bg-gray-800/50'}>
                <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{feature.name}</div>
                  {feature.description && (
                    <div className="text-gray-500 dark:text-gray-400">{feature.description}</div>
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-center">
                  {feature.free ? (
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeatureComparison;