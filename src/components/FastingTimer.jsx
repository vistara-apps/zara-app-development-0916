import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { formatDuration } from '../utils/timeUtils';

const FastingTimer = ({ 
  isActive = false, 
  startTime = null, 
  onStart, 
  onStop, 
  onReset,
  fastingGoalHours = 16
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Not fasting');

  // Calculate elapsed time and progress
  useEffect(() => {
    let interval = null;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const startDate = new Date(startTime);
        const elapsedMs = now - startDate;
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        
        setElapsed(elapsedMs);
        setProgress(Math.min(100, (elapsedHours / fastingGoalHours) * 100));
        
        // Update status text based on elapsed time
        if (elapsedHours < 12) {
          setStatusText('Early fasting phase');
        } else if (elapsedHours < 16) {
          setStatusText('Fat burning phase');
        } else if (elapsedHours < 24) {
          setStatusText('Deep fat burning phase');
        } else if (elapsedHours < 48) {
          setStatusText('Autophagy phase');
        } else {
          setStatusText('Extended fasting phase');
        }
      }, 1000);
    } else {
      setStatusText('Not fasting');
    }
    
    return () => clearInterval(interval);
  }, [isActive, startTime, fastingGoalHours]);

  // Format elapsed time
  const formattedTime = formatDuration(elapsed);

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={progress}
            size={200}
            thickness={4}
            sx={{ color: progress >= 100 ? 'success.main' : 'primary.main' }}
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
            <Typography variant="h4" component="div" color="text.primary" fontWeight="bold">
              {formattedTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isActive ? `${Math.round(progress)}% complete` : 'Ready to start'}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h6" color="primary" gutterBottom>
          {statusText}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {isActive 
            ? `You're ${formattedTime} into your fast.` 
            : `Target: ${fastingGoalHours} hours`}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isActive ? (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PlayArrowIcon />}
              onClick={onStart}
              size="large"
            >
              Start Fast
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={<PauseIcon />}
              onClick={onStop}
              size="large"
            >
              End Fast
            </Button>
          )}
          
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            size="large"
            disabled={!isActive}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FastingTimer;

