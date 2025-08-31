import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navigation from './components/Navigation';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import TimerPage from './pages/TimerPage';
import CheckInPage from './pages/CheckInPage';
import ProgressPage from './pages/ProgressPage';
import JournalPage from './pages/JournalPage';
import PlanPage from './pages/PlanPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#5e35b1',
      light: '#9162e4',
      dark: '#280680',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#26a69a',
      light: '#64d8cb',
      dark: '#00766c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Onboarding Route component
const OnboardingRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!userProfile?.onboardingCompleted) {
    return <Navigate to="/onboarding" />;
  }
  
  return children;
};

// Public Route component (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (currentUser) {
    return <Navigate to="/timer" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Navigation />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              
              {/* Onboarding route */}
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              
              {/* Protected routes (require authentication and completed onboarding) */}
              <Route path="/timer" element={<OnboardingRoute><TimerPage /></OnboardingRoute>} />
              <Route path="/check-in" element={<OnboardingRoute><CheckInPage /></OnboardingRoute>} />
              <Route path="/progress" element={<OnboardingRoute><ProgressPage /></OnboardingRoute>} />
              <Route path="/journal" element={<OnboardingRoute><JournalPage /></OnboardingRoute>} />
              <Route path="/plan" element={<OnboardingRoute><PlanPage /></OnboardingRoute>} />
              <Route path="/settings" element={<OnboardingRoute><SettingsPage /></OnboardingRoute>} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

