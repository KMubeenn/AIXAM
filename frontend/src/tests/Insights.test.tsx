import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Insights from '../pages/Analytics/components/Insights';

// Mock the Recharts library completely to prevent rendering issues in JSDOM
vi.mock('recharts', () => {
  const OriginalRechartsModule = vi.importActual('recharts');
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => <div />,
    Cell: () => <div />,
    LineChart: () => <div data-testid="line-chart" />,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    CartesianGrid: () => <div />,
    BarChart: () => <div data-testid="bar-chart" />,
    Bar: () => <div />
  };
});

// Mock the hook that fetches the insights
vi.mock('../../../hooks/useCore', () => ({
  useGenerateInsights: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })
}));

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('Insights Dashboard Rendering', () => {
  it('renders the empty state correctly when no data is present', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Insights />
      </QueryClientProvider>
    );
    
    expect(screen.getByText(/AI-Powered Analytics/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze My Performance/i })).toBeInTheDocument();
  });
});
