import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box,
  Menu, MenuItem, Avatar, Tooltip, Badge
} from '@mui/material';
import {
  DirectionsCar, Notifications, AccountCircle,
  Dashboard, ExitToApp, Build
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'mechanic' ? '/mechanic/dashboard' : '/client/dashboard';

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo */}
        <DirectionsCar sx={{ mr: 1 }} />
        <Typography
          variant="h6" fontWeight="bold" sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate(dashboardPath)}
        >
          CarConnect
        </Typography>

        {/* Role badge */}
        <Box
          sx={{
            bgcolor: user?.role === 'mechanic' ? 'secondary.main' : 'primary.dark',
            px: 1.5, py: 0.5, borderRadius: 2, mr: 2
          }}
        >
          <Typography variant="caption" fontWeight="bold">
            {user?.role === 'mechanic' ? '🔧 מוסכניק' : '🚗 לקוח'}
          </Typography>
        </Box>

        {/* Notifications (placeholder) */}
        <Tooltip title="התראות">
          <IconButton color="inherit">
            <Badge badgeContent={0} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User menu */}
        <Tooltip title={user?.name}>
          <IconButton onClick={e => setAnchorEl(e.currentTarget)} color="inherit">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.9rem' }}>
              {user?.name?.[0]}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
          </MenuItem>
          <MenuItem onClick={() => { navigate(dashboardPath); setAnchorEl(null); }}>
            <Dashboard fontSize="small" sx={{ mr: 1 }} /> דשבורד
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ExitToApp fontSize="small" sx={{ mr: 1 }} /> יציאה
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
