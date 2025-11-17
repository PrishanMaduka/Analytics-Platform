'use client'

import { Paper, Typography, Box } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

interface MetricsWidgetProps {
  title: string
  value: string
  change: string
}

export function MetricsWidget({ title, value, change }: MetricsWidgetProps) {
  const isPositive = change.startsWith('+')
  const isNegative = change.startsWith('-')

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive && <TrendingUp color="success" fontSize="small" />}
        {isNegative && <TrendingDown color="error" fontSize="small" />}
        <Typography
          variant="body2"
          color={isPositive ? 'success.main' : 'error.main'}
        >
          {change}
        </Typography>
      </Box>
    </Paper>
  )
}

