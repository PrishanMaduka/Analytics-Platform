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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'

interface Crash {
  id: string
  sessionId: string
  userId?: string
  exceptionType: string
  exceptionMessage: string
  timestamp: number
  deviceInfo: {
    platform: string
    osVersion: string
    deviceModel: string
    appVersion: string
  }
  affectedUsers: number
  occurrences: number
}

export function CrashAnalysisDashboard() {
  const [selectedCrash, setSelectedCrash] = useState<Crash | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: crashes, isLoading } = useQuery({
    queryKey: ['crashes', filter],
    queryFn: async () => {
      const response = await api.get(`/api/v1/crashes?filter=${filter}`)
      return response.data as Crash[]
    },
  })

  const { data: crashDetails } = useQuery({
    queryKey: ['crash-details', selectedCrash?.id],
    queryFn: async () => {
      if (!selectedCrash) return null
      const response = await api.get(`/api/v1/crashes/${selectedCrash.id}`)
      return response.data
    },
    enabled: !!selectedCrash,
  })

  const filteredCrashes = crashes?.filter((crash) =>
    crash.exceptionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crash.exceptionMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Crash Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search crashes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filter} label="Filter" onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="all">All Crashes</MenuItem>
              <MenuItem value="recent">Recent (24h)</MenuItem>
              <MenuItem value="frequent">Most Frequent</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedCrash ? 7 : 12}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exception Type</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Platform</TableCell>
                    <TableCell>Occurrences</TableCell>
                    <TableCell>Affected Users</TableCell>
                    <TableCell>Last Seen</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCrashes?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No crashes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCrashes?.map((crash) => (
                      <TableRow
                        key={crash.id}
                        hover
                        onClick={() => setSelectedCrash(crash)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {crash.exceptionType.split('.').pop()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                            {crash.exceptionMessage}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={crash.deviceInfo.platform}
                            size="small"
                            color={crash.deviceInfo.platform === 'Android' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>{crash.occurrences}</TableCell>
                        <TableCell>{crash.affectedUsers}</TableCell>
                        <TableCell>
                          {format(new Date(crash.timestamp), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCrash(crash)
                          }}>
                            View Details
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

        {selectedCrash && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Crash Details
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Exception Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCrash.exceptionType}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Message
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedCrash.exceptionMessage}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Device Info
                </Typography>
                <Typography variant="body2">
                  {selectedCrash.deviceInfo.platform} {selectedCrash.deviceInfo.osVersion}
                  <br />
                  {selectedCrash.deviceInfo.deviceModel}
                  <br />
                  App Version: {selectedCrash.deviceInfo.appVersion}
                </Typography>

                {crashDetails?.stackTrace && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                      Stack Trace
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: 400,
                        fontSize: '0.75rem',
                      }}
                    >
                      {crashDetails.stackTrace}
                    </Box>
                  </>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button variant="outlined" size="small">
                    Resolve
                  </Button>
                  <Button variant="outlined" size="small">
                    Ignore
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}

