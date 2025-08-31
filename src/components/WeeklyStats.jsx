import React from 'react';
import { Box, Typography, Paper, Grid, Divider, Chip, CircularProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockIcon from '@mui/icons-material/Lock';

const WeeklyStats = ({ 
  stats = {}, 
  isPremium = false,
  onUpgrade
}) => {
  const { 
    totalSessions = 0, 
    completedSessions = 0, 
    totalHours = 0, 
    averageDuration = 0,
    fastingScore = 0
  } = stats;
  
  // Format hours with one decimal place
  const formatHours = (hours) => {
    return Math.round(hours * 10) / 10;
  };
  
  // Get color based on fasting score
  const getScoreColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'primary.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Weekly Stats</Typography>
        <Chip 
          label={`${completedSessions}/${totalSessions} days`} 
          color="primary" 
          size="small" 
          icon={<CalendarTodayIcon />}
        />
      </Box>
      
      <Grid container spacing={3}>
        {/* Total Fasting Hours */}
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Hours
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" fontWeight="medium">
                {formatHours(totalHours)}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Average Duration */}
        <Grid item xs={6}>
          <Box sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Avg. Duration
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" fontWeight="medium">
                {formatHours(averageDuration)}h
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Fasting Score (Premium Feature) */}
      <Box sx={{ textAlign: 'center', py: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Weekly Fasting Score
          {!isPremium && (
            <Chip 
              label="Premium" 
              size="small" 
              icon={<LockIcon sx={{ fontSize: '0.8rem !important' }} />} 
              sx={{ ml: 1, height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } }}
            />
          )}
        </Typography>
        
        {isPremium ? (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress 
              variant="determinate" 
              value={fastingScore} 
              size={80}
              thickness={5}
              sx={{ color: getScoreColor(fastingScore) }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" component="div" fontWeight="bold">
                {fastingScore}
              </Typography>
              <EmojiEventsIcon fontSize="small" sx={{ color: getScoreColor(fastingScore) }} />
            </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              py: 1
            }}
            onClick={onUpgrade}
          >
            <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="primary">
              Upgrade to Premium
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WeeklyStats;

