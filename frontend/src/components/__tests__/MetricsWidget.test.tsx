import { render, screen } from '@testing-library/react'
import { MetricsWidget } from '../MetricsWidget'

describe('MetricsWidget', () => {
  it('renders title and value', () => {
    render(<MetricsWidget title="Test Metric" value="100" change="+5%" />)
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('+5%')).toBeInTheDocument()
  })

  it('shows positive change with green color', () => {
    render(<MetricsWidget title="Test" value="100" change="+5%" />)
    
    const changeElement = screen.getByText('+5%')
    expect(changeElement).toHaveStyle({ color: expect.stringContaining('success') })
  })

  it('shows negative change with red color', () => {
    render(<MetricsWidget title="Test" value="100" change="-5%" />)
    
    const changeElement = screen.getByText('-5%')
    expect(changeElement).toHaveStyle({ color: expect.stringContaining('error') })
  })
})

