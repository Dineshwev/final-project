// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock recharts components that rely on browser APIs not available in JSDOM (ResizeObserver)
// This keeps tests fast and avoids needing a ResizeObserver polyfill.
jest.mock('recharts', () => {
	const React = require('react');
	return {
		ResponsiveContainer: (props: any) => React.createElement('div', null, props.children),
		BarChart: (props: any) => React.createElement('div', null, props.children),
		Bar: (props: any) => React.createElement('div', null, props.children),
		XAxis: () => React.createElement('div', null),
		YAxis: () => React.createElement('div', null),
		Tooltip: () => React.createElement('div', null),
		Legend: () => React.createElement('div', null),
		Cell: () => React.createElement('div', null)
	};
});
