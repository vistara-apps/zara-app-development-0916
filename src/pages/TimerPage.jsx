import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, Button } from '@mui/material';
import FastingTimer from '../components/FastingTimer';
import WeeklyStats from '../components/WeeklyStats';
import { useAuth } from '../contexts/AuthContext';
import { 
  startFastingSession, 
  endFastingSession, 
  getActiveSession,
  getWeeklyFastingStats
} from '../services/fastingPlan';
import { getCurrentFastingPlan } from '../services/fastingPlan';

const TimerPage = () => {
  const { currentUser, isPremium } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [fastingPlan, setFastingPlan] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Fetch active session and fasting plan
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        try {
          // Get active session
          const session = await getActiveSession(currentUser.uid);
          setActiveSession(session);
          
          // Get current fasting plan
          const plan = await getCurrentFastingPlan(currentUser.uid);
          setFastingPlan(plan);
          
          // Get weekly stats
          const stats = await getWeeklyFastingStats(currentUser.uid);
          setWeeklyStats(stats);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Start fasting session
  const handleStartFasting = async () => {
    if (!currentUser) return;
    
    try {
      await startFastingSession(currentUser.uid);
      
      // Refresh active session
      const session = await getActiveSession(currentUser.uid);
      setActiveSession(session);
    } catch (error) {
      console.error('Error starting fasting session:', error);
    }
  };
  
  // End fasting session
  const handleEndFasting = async () => {
    if (!currentUser || !activeSession) return;
    
    try {
      await endFastingSession(currentUser.uid, activeSession.id);
      
      // Refresh active session
      setActiveSession(null);
      
      // Refresh weekly stats
      const stats = await getWeeklyFastingStats(currentUser.uid);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error ending fasting session:', error);
    }
  };
  
  // Reset fasting session
  const handleResetFasting = async () => {
    if (!currentUser || !activeSession) return;
    
    try {
      // End current session
      await endFastingSession(currentUser.uid, activeSession.id);
      
      // Start new session
      await startFastingSession(currentUser.uid);
      
      // Refresh active session
      const session = await getActiveSession(currentUser.uid);
      setActiveSession(session);
    } catch (error) {
      console.error('Error resetting fasting session:', error);
    }
  };
  
  // Handle upgrade to premium
  const handleUpgrade = () => {
    // Navigate to settings or show paywall
    console.log('Upgrade to premium');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Fasting Timer
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your fasting progress and stay motivated.
            </Typography>
          </Box>
          
          <FastingTimer 
            isActive={!!activeSession}
            startTime={activeSession?.startTime}
            onStart={handleStartFasting}
            onStop={handleEndFasting}
            onReset={handleResetFasting}
            fastingGoalHours={fastingPlan?.fastingHours || 16}
          />
          
          {fastingPlan && (
            <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Your Fasting Plan
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Protocol:</strong> {fastingPlan.protocol}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Fasting Window:</strong> {fastingPlan.fastingWindow?.start} - {fastingPlan.fastingWindow?.end}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Eating Window:</strong> {fastingPlan.eatingWindow?.start} - {fastingPlan.eatingWindow?.end}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Recommendations:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {fastingPlan.recommendations?.map((rec, index) => (
                  <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {rec}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <WeeklyStats 
            stats={weeklyStats}
            isPremium={isPremium}
            onUpgrade={handleUpgrade}
          />
          
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth 
              component="a" 
              href="/check-in"
            >
              Daily Check-in
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TimerPage;

