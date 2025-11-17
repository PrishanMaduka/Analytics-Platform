'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Mon', value: 240 },
  { name: 'Tue', value: 235 },
  { name: 'Wed', value: 245 },
  { name: 'Thu', value: 250 },
  { name: 'Fri', value: 245 },
  { name: 'Sat', value: 240 },
  { name: 'Sun', value: 238 },
]

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
          name="Response Time (ms)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

