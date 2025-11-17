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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { format } from 'date-fns'

interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  metric: string
  enabled: boolean
  channels: string[]
  createdAt: number
  lastTriggered?: number
}

export function AlertingDashboard() {
  const [openDialog, setOpenDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const queryClient = useQueryClient()

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/api/v1/alerts')
      return response.data as AlertRule[]
    },
  })

  const { data: alertHistory } = useQuery({
    queryKey: ['alert-history'],
    queryFn: async () => {
      const response = await api.get('/api/v1/alerts/history')
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (rule: Partial<AlertRule>) => {
      const response = await api.post('/api/v1/alerts', rule)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setOpenDialog(false)
      setEditingRule(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...rule }: Partial<AlertRule> & { id: string }) => {
      const response = await api.put(`/api/v1/alerts/${id}`, rule)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      setOpenDialog(false)
      setEditingRule(null)
    },
  })

  const handleCreate = () => {
    setEditingRule(null)
    setOpenDialog(true)
  }

  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule)
    setOpenDialog(true)
  }

  const handleSave = (rule: Partial<AlertRule>) => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, ...rule })
    } else {
      createMutation.mutate(rule)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Alerting & Configuration
        </Typography>
        <Button variant="contained" onClick={handleCreate}>
          Create Alert Rule
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Condition</TableCell>
                    <TableCell>Metric</TableCell>
                    <TableCell>Threshold</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Triggered</TableCell>
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
                  ) : alerts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No alert rules configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts?.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{alert.name}</TableCell>
                        <TableCell>{alert.condition}</TableCell>
                        <TableCell>{alert.metric}</TableCell>
                        <TableCell>{alert.threshold}</TableCell>
                        <TableCell>
                          <Chip
                            label={alert.enabled ? 'Enabled' : 'Disabled'}
                            size="small"
                            color={alert.enabled ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {alert.lastTriggered
                            ? format(new Date(alert.lastTriggered), 'MMM dd, HH:mm')
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleEdit(alert)}>
                            Edit
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

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Remote Configuration
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                Edit Feature Flags
              </Button>
              <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                Update Sampling Rates
              </Button>
              <Button variant="outlined" fullWidth>
                A/B Testing Config
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              defaultValue={editingRule?.name}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select defaultValue={editingRule?.metric || ''} label="Metric">
                <MenuItem value="crash_rate">Crash Rate</MenuItem>
                <MenuItem value="error_rate">Error Rate</MenuItem>
                <MenuItem value="response_time">Response Time</MenuItem>
                <MenuItem value="cpu_usage">CPU Usage</MenuItem>
                <MenuItem value="memory_usage">Memory Usage</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select defaultValue={editingRule?.condition || ''} label="Condition">
                <MenuItem value="greater_than">Greater Than</MenuItem>
                <MenuItem value="less_than">Less Than</MenuItem>
                <MenuItem value="equals">Equals</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Threshold"
              type="number"
              defaultValue={editingRule?.threshold}
              fullWidth
            />
            <FormControlLabel
              control={<Switch defaultChecked={editingRule?.enabled} />}
              label="Enabled"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Get form values and call handleSave
              handleSave({})
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

