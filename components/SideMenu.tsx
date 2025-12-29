"use client";

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  ListSubheader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import LogoutIcon from '@mui/icons-material/Logout';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import TodoModal from './TodoModal';
import api from '../lib/axios';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleColorMode, mode } = useThemeContext();
  const { logout, user, selectedUserId, setSelectedUserId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    }
  }, [user]);

  React.useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setAdminMenuOpen(true);
    }
  }, [pathname]);

  const listItemSx = {
    '&:hover': {
      backgroundColor: theme.palette.mode === 'light' ? '#1976d2' : undefined,
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.mode === 'light' ? '#1976d2' : 'rgba(144, 202, 249, 0.16)',
      color: theme.palette.mode === 'light' ? 'white' : '#90caf9',
      '& .MuiListItemIcon-root': {
        color: theme.palette.mode === 'light' ? 'white' : '#90caf9',
      },
      '&:hover': {
        backgroundColor: theme.palette.mode === 'light' ? '#1976d2' : 'rgba(144, 202, 249, 0.24)',
      },
    },
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <TaskAltIcon color="primary" />
          <Typography variant="h6" noWrap component="div">
            Agile Tasks
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        <ListSubheader>Main status board</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/workload')}
            selected={pathname === '/workload' || pathname === '/'}
            sx={listItemSx}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Main" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Todo menu</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/todos')}
            selected={pathname === '/todos' && !searchParams.get('deleted')}
            sx={listItemSx}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Track status" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setIsModalOpen(true)} data-testid="sidebar-create">
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Agile menu</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/board')}
            selected={pathname === '/board'}
            sx={listItemSx}
          >
            <ListItemIcon>
              <ViewKanbanIcon />
            </ListItemIcon>
            <ListItemText primary="Board" />
          </ListItemButton>
        </ListItem>
      </List>
      {user?.role === 'admin' && (
        <>
          <Divider />
          <List>
            <ListSubheader>Admin menu</ListSubheader>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setAdminMenuOpen(!adminMenuOpen)}>
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {adminMenuOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleNavigation('/admin/console')}
                    selected={pathname.startsWith('/admin') && !pathname.startsWith('/admin/workspace')}
                    sx={{ ...listItemSx, pl: 4 }}
                  >
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Console" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleNavigation('/admin/workspace/2?id=1&name=yar')}
                    selected={pathname.startsWith('/admin/workspace')}
                    sx={{ ...listItemSx, pl: 4 }}
                  >
                    <ListItemIcon>
                      <WorkspacesIcon />
                    </ListItemIcon>
                    <ListItemText primary="Workspace" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user ? `Welcome, ${user.name}` : 'Agile Tasks'}
          </Typography>
          {user?.role === 'admin' && (
            <FormControl size="small" sx={{ minWidth: 120, mr: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUserId || ''}
                label="User"
                onChange={(e) => setSelectedUserId(e.target.value || null)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: mode === 'light' ? '#1976d2' : undefined                      },
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: mode === 'light' ? '#1976d2' : undefined,
                        color: mode === 'light' ? 'white' : undefined,
                        '&:hover': {
                          backgroundColor: mode === 'light' ? '#0d47a1' : undefined,
                        }                      }
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <em>All Users</em>
                </MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Tooltip title="Toggle theme">
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton sx={{ ml: 1 }} onClick={logout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'block' }, // Always block, controlled by variant
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            zIndex: isMobile ? 1300 : 'auto', // High z-index for mobile
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
      {<TodoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
}
