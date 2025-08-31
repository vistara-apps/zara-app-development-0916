import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import ProgressChart from '../components/ProgressChart';
import MoodTrend from '../components/MoodTrend';
import WeeklyStats from '../components/WeeklyStats';
import { useAuth } from '../contexts/AuthContext';
import { 
  getWeeklyFastingStats, 
  getMonthlyFastingData,
  getFastingHistory
} from '../services/fastingPlan';
import { getMoodAndEnergyTrend } from '../services/checkIn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useNavigate } from 'react-router-dom';

const ProgressPage = () => {
  const { currentUser, isPremium } = useAuth();
  const navigate = useNavigate();
  
  const [weeklyStats, setWeeklyStats] = useState({});
  const [fastingData, setFastingData] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  
  // Fetch data based on time range
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        // Get weekly stats
        const stats = await getWeeklyFastingStats(currentUser.uid);
        setWeeklyStats(stats);
        
        // Get fasting data based on time range
        let data;
        if (timeRange === 'week') {
          data = await getMonthlyFastingData(currentUser.uid, 7);
        } else if (timeRange === 'month') {
          data = await getMonthlyFastingData(currentUser.uid, 30);
        } else {
          data = await getMonthlyFastingData(currentUser.uid, 90);
        }
        
        setFastingData({
          labels: data.labels,
          datasets: [
            {
              label: 'Fasting Hours',
              data: data.fastingHours,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            }
          ]
        });
        
        // Get mood and energy trend
        const moodTrend = await getMoodAndEnergyTrend(currentUser.uid, timeRange);
        setMoodData(moodTrend);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, timeRange]);
  
  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };
  
  // Handle upgrade to premium
  const handleUpgrade = () => {
    navigate('/settings');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Progress Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your fasting journey and see your improvements over time.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          aria-label="time range"
          size="small"
        >
          <ToggleButton value="week" aria-label="week">
            <CalendarTodayIcon sx={{ mr: 1 }} />
            Week
          </ToggleButton>
          <ToggleButton value="month" aria-label="month">
            <DateRangeIcon sx={{ mr: 1 }} />
            Month
          </ToggleButton>
          <ToggleButton value="quarter" aria-label="quarter">
            <EventNoteIcon sx={{ mr: 1 }} />
            3 Months
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/check-in')}
        >
          Daily Check-in
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <ProgressChart 
            data={fastingData}
            title="Fasting Duration"
            type="bar"
            height={300}
          />
          
          <Box sx={{ mt: 4 }}>
            <MoodTrend data={moodData} height={300} />
          </Box>
          
          <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Progress Insights
            </Typography>
            <Typography variant="body2" paragraph>
              {isPremium ? (
                <>
                  Based on your data, your most successful fasting days are <strong>Monday</strong> and <strong>Wednesday</strong>. 
                  Your average fasting duration has <strong>increased by 2.3 hours</strong> compared to last week.
                </>
              ) : (
                <>
                  Upgrade to premium to get personalized insights about your fasting patterns and recommendations to improve your results.
                </>
              )}
            </Typography>
            
            {!isPremium && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleUpgrade}
                sx={{ mt: 1 }}
              >
                Upgrade to Premium
              </Button>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <WeeklyStats 
            stats={weeklyStats}
            isPremium={isPremium}
            onUpgrade={handleUpgrade}
          />
          
          <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Fasting Streaks
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Streak
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {weeklyStats.currentStreak || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                consecutive days
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Longest Streak
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {weeklyStats.longestStreak || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                consecutive days
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProgressPage;

