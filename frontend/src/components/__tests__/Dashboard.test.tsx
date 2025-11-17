import { render, screen } from '@testing-library/react'
import { Dashboard } from '../Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )
    
    expect(screen.getByText('MxL Dashboard')).toBeInTheDocument()
  })

  it('renders metrics widgets', () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    )
    
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('Crash Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument()
    expect(screen.getByText('Error Rate')).toBeInTheDocument()
  })
})

