'use client'

import { Box, Container, Typography, Grid, Paper } from '@mui/material'
import { MetricsWidget } from './MetricsWidget'
import { PerformanceChart } from './PerformanceChart'

export function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        MxL Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <MetricsWidget
            title="Total Sessions"
            value="12,345"
            change="+5.2%"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsWidget
            title="Crash Rate"
            value="0.12%"
            change="-0.03%"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsWidget
            title="Avg Response Time"
            value="245ms"
            change="-12ms"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <MetricsWidget
            title="Error Rate"
            value="0.08%"
            change="-0.01%"
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trends
            </Typography>
            <PerformanceChart />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Crashes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crash list will be displayed here
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

