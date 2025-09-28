// Jest Setup for Next.js Testing
// filepath: c:\Users\menno\Source\Repos\requirements-gathering-agent\admin-interface\jest.setup.js

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock Recharts for chart components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  RadarChart: ({ children }) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const icons = [
    'CheckCircle', 'AlertTriangle', 'XCircle', 'TrendingUp', 'FileText', 
    'Award', 'Eye', 'Download', 'RefreshCw', 'Bell', 'Wifi', 'WifiOff', 
    'Clock', 'Activity', 'Users', 'Plus', 'Search', 'Filter', 'Edit', 
    'Trash2', 'Upload', 'Settings', 'Home', 'User', 'LogOut'
  ];
  
  const MockIcon = ({ className, ...props }) => (
    <svg className={className} data-testid="mock-icon" {...props} />
  );
  
  return icons.reduce((acc, iconName) => {
    acc[iconName] = MockIcon;
    return acc;
  }, {});
});

// Setup test environment
beforeEach(() => {
  fetch.mockClear();
});
