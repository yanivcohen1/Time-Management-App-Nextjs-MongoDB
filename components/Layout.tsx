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
  Typography,
  useMediaQuery,
  useTheme,
  ListSubheader,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import LogoutIcon from '@mui/icons-material/Logout';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import TodoModal from './TodoModal';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleColorMode, mode } = useThemeContext();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const listItemSx = {
    '&.Mui-selected': {
      backgroundColor: theme.palette.mode === 'light' ? '#e3f2fd' : 'rgba(144, 202, 249, 0.16)',
      color: theme.palette.mode === 'light' ? '#1976d2' : '#90caf9',
      '& .MuiListItemIcon-root': {
        color: theme.palette.mode === 'light' ? '#1976d2' : '#90caf9',
      },
      '&:hover': {
        backgroundColor: theme.palette.mode === 'light' ? '#bbdefb' : 'rgba(144, 202, 249, 0.24)',
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
            selected={router.pathname === '/workload'}
            sx={listItemSx}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dates by workload" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Todo menu</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/todos')}
            selected={router.pathname === '/todos' && !router.query.deleted}
            sx={listItemSx}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Track status" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => setIsModalOpen(true)}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/todos?deleted=true')}
            selected={router.pathname === '/todos' && router.query.deleted === 'true'}
            sx={listItemSx}
          >
             {/* Placeholder for Delete/Recycle Bin */}
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListSubheader>Agile menu</ListSubheader>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/')}
            selected={router.pathname === '/'}
            sx={listItemSx}
          >
            <ListItemIcon>
              <ViewKanbanIcon />
            </ListItemIcon>
            <ListItemText primary="Board" />
          </ListItemButton>
        </ListItem>
      </List>
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
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton sx={{ ml: 1 }} onClick={logout} color="inherit">
            <LogoutIcon />
          </IconButton>
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
