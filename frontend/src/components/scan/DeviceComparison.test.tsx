import React from 'react';
import { render, screen } from '@testing-library/react';

import DeviceComparison from './DeviceComparison';

describe('DeviceComparison component (smoke)', () => {
  it('renders without crashing (loading)', () => {
    render(<DeviceComparison mobile={undefined} desktop={undefined} comparison={{}} responsive={{}} loading={true} />);
    // Loading state should show the analyzing text inside the mobile card
    expect(screen.getByText(/Analyzing mobile performance/i)).toBeInTheDocument();
  });

  it('shows empty state when no device data and not loading', () => {
    const mockRetry = jest.fn();
    render(<DeviceComparison mobile={null} desktop={null} comparison={{}} responsive={{}} loading={false} onRetry={mockRetry} />);
    expect(screen.getByText(/No device comparison data yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Analysis/i })).toBeInTheDocument();
  });

  it('renders mobile and desktop scores correctly', () => {
    const mobile = { scores: { performance: 65, accessibility: 80, bestPractices: 70, seo: 75 }, metrics: {}, audits: {}, source: 'mock-mobile' };
    const desktop = { scores: { performance: 88, accessibility: 85, bestPractices: 90, seo: 92 }, metrics: {}, audits: {}, source: 'mock-desktop' };
    const comparison = { mobileIssues: [] };
    render(<DeviceComparison mobile={mobile} desktop={desktop} comparison={comparison} responsive={{ mobileUsabilityScore: 85 }} loading={false} />);

  expect(screen.getAllByText(/Mobile/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Desktop/i).length).toBeGreaterThan(0);
    // Score numbers appear in the summary area
    expect(screen.getByText(/65/)).toBeInTheDocument();
    expect(screen.getByText(/88/)).toBeInTheDocument();
  });
});
