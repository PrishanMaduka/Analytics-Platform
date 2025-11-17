'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface NetworkEvent {
  url: string
  method: string
  statusCode: number
  duration: number
  requestSize: number
  responseSize: number
  timestamp: number
  errorCount: number
  successCount: number
}

export function NetworkMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState('1h')

  const { data: endpoints, isLoading } = useQuery({
    queryKey: ['network-endpoints', timeRange],
    queryFn: async () => {
      const response = await api.get(`/api/v1/network/endpoints?range=${timeRange}`)
      return response.data as NetworkEvent[]
    },
  })

  const { data: timeline } = useQuery({
    queryKey: ['network-timeline', timeRange],
    queryFn: async () => {
      const response = await api.get(`/api/v1/network/timeline?range=${timeRange}`)
      return response.data
    },
  })

  const slowEndpoints = endpoints
    ?.filter((e) => e.duration > 1000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10)

  const errorEndpoints = endpoints
    ?.filter((e) => e.errorCount > 0)
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10)

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Network Monitoring
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Request Timeline
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" />
                <Line type="monotone" dataKey="errors" stroke="#ff0000" name="Errors" />
                <Line type="monotone" dataKey="avgDuration" stroke="#82ca9d" name="Avg Duration (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Slow Endpoints
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Avg Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : slowEndpoints?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No slow endpoints
                      </TableCell>
                    </TableRow>
                  ) : (
                    slowEndpoints?.map((endpoint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {endpoint.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={endpoint.method}
                            size="small"
                            color={endpoint.method === 'GET' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{endpoint.duration}ms</TableCell>
                        <TableCell>
                          <Chip
                            label={endpoint.statusCode}
                            size="small"
                            color={endpoint.statusCode >= 400 ? 'error' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Error Endpoints
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Errors</TableCell>
                    <TableCell>Success Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : errorEndpoints?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No errors
                      </TableCell>
                    </TableRow>
                  ) : (
                    errorEndpoints?.map((endpoint, index) => {
                      const total = endpoint.errorCount + endpoint.successCount
                      const successRate = total > 0 ? ((endpoint.successCount / total) * 100).toFixed(1) : '0'
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {endpoint.url}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={endpoint.method} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={endpoint.errorCount} size="small" color="error" />
                          </TableCell>
                          <TableCell>{successRate}%</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Endpoint Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={endpoints?.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="url" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration" fill="#8884d8" name="Duration (ms)" />
                <Bar dataKey="errorCount" fill="#ff0000" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

