'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BugReportIcon from '@mui/icons-material/BugReport'
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck'
import RouteIcon from '@mui/icons-material/Route'
import NotificationsIcon from '@mui/icons-material/Notifications'

const drawerWidth = 240

const menuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/' },
  { text: 'Crashes', icon: BugReportIcon, path: '/crashes' },
  { text: 'Network', icon: NetworkCheckIcon, path: '/network' },
  { text: 'User Journeys', icon: RouteIcon, path: '/journeys' },
  { text: 'Alerts', icon: NotificationsIcon, path: '/alerts' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                >
                  <ListItemIcon>
                    <Icon color={isActive ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    </Drawer>
  )
}

