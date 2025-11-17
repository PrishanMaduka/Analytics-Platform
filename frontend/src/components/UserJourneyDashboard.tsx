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
  Button,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Session {
  id: string
  sessionId: string
  userId?: string
  startedAt: number
  endedAt?: number
  duration: number
  screenViews: number
  events: number
  platform: string
}

interface UserJourney {
  sessionId: string
  screens: Array<{
    name: string
    timestamp: number
    duration: number
  }>
  events: Array<{
    type: string
    timestamp: number
    data: any
  }>
}

export function UserJourneyDashboard() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await api.get('/api/v1/sessions')
      return response.data as Session[]
    },
  })

  const { data: journey } = useQuery({
    queryKey: ['journey', selectedSession?.sessionId],
    queryFn: async () => {
      if (!selectedSession) return null
      const response = await api.get(`/api/v1/sessions/${selectedSession.sessionId}/journey`)
      return response.data as UserJourney
    },
    enabled: !!selectedSession,
  })

  const journeyData = journey?.screens.map((screen, index) => ({
    step: index + 1,
    screen: screen.name,
    duration: screen.duration,
  }))

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Journeys
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedSession ? 7 : 12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Session ID</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Screen Views</TableCell>
                    <TableCell>Events</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : sessions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions?.map((session) => (
                      <TableRow
                        key={session.id}
                        hover
                        onClick={() => setSelectedSession(session)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {session.sessionId.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>{session.userId || 'Anonymous'}</TableCell>
                        <TableCell>
                          <Chip
                            label={session.platform}
                            size="small"
                            color={session.platform === 'Android' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{Math.round(session.duration / 1000)}s</TableCell>
                        <TableCell>{session.screenViews}</TableCell>
                        <TableCell>{session.events}</TableCell>
                        <TableCell>
                          {format(new Date(session.startedAt), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSession(session)
                            }}
                          >
                            View Journey
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {selectedSession && journey && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Journey
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Screen Flow
                </Typography>
                <Stepper orientation="vertical" sx={{ mt: 2 }}>
                  {journey.screens.map((screen, index) => (
                    <Step key={index} active>
                      <StepLabel>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {screen.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(screen.duration / 1000)}s
                          </Typography>
                        </Box>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {journeyData && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Journey Timeline
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={journeyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="screen" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (s)" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Events ({journey.events.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {journey.events.map((event, index) => (
                    <Chip
                      key={index}
                      label={`${event.type}: ${JSON.stringify(event.data)}`}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

