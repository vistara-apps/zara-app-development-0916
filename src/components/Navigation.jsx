import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import TimerIcon from '@mui/icons-material/Timer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoodIcon from '@mui/icons-material/Mood';
import MicIcon from '@mui/icons-material/Mic';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Navigation items
  const navItems = [
    { text: 'Timer', icon: <TimerIcon />, path: '/timer' },
    { text: 'Check-in', icon: <MoodIcon />, path: '/check-in' },
    { text: 'Progress', icon: <AssessmentIcon />, path: '/progress' },
    { text: 'Journal', icon: <MicIcon />, path: '/journal' },
    { text: 'Plan', icon: <CalendarTodayIcon />, path: '/plan' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];
  
  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  // Check if path is active
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {currentUser && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={userProfile?.photoURL} 
            alt={userProfile?.displayName || currentUser.email}
            sx={{ mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" noWrap>
              {userProfile?.displayName || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {currentUser.email}
            </Typography>
          </Box>
        </Box>
      )}
      
      <Divider />
      
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={isActive(item.path)}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.contrastText' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {currentUser ? (
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button component={Link} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button component={Link} to="/signup">
            <ListItemText primary="Sign Up" />
          </ListItem>
        </List>
      )}
    </Box>
  );
  
  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {currentUser && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            FastFlow
          </Typography>
          
          {!currentUser ? (
            <Box>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/signup"
              >
                Sign Up
              </Button>
            </Box>
          ) : !isMobile ? (
            <Box sx={{ display: 'flex' }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  color={isActive(item.path) ? 'primary' : 'inherit'}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ mx: 0.5 }}
                >
                  {item.text}
                </Button>
              ))}
              <Button 
                color="inherit" 
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ ml: 1 }}
              >
                Logout
              </Button>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navigation;

