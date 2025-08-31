import React from 'react';
import { Box, Typography, Paper, Slider, Button } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import Battery20Icon from '@mui/icons-material/Battery20';
import Battery50Icon from '@mui/icons-material/Battery50';
import Battery80Icon from '@mui/icons-material/Battery80';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const MoodSelector = ({ 
  mood = 3, 
  energyLevel = 3, 
  hungerLevel = 3, 
  onMoodChange, 
  onEnergyChange, 
  onHungerChange,
  onSubmit
}) => {
  // Mood icons
  const moodIcons = [
    <SentimentVeryDissatisfiedIcon fontSize="large" />,
    <SentimentDissatisfiedIcon fontSize="large" />,
    <SentimentNeutralIcon fontSize="large" />,
    <SentimentSatisfiedIcon fontSize="large" />,
    <SentimentVerySatisfiedIcon fontSize="large" />
  ];
  
  // Energy icons
  const energyIcons = [
    <BatteryAlertIcon fontSize="large" />,
    <Battery20Icon fontSize="large" />,
    <Battery50Icon fontSize="large" />,
    <Battery80Icon fontSize="large" />,
    <BatteryFullIcon fontSize="large" />
  ];
  
  // Hunger icons (using the same icon but different colors)
  const hungerColors = ['#e0e0e0', '#c5e1a5', '#ffcc80', '#ef9a9a', '#ef5350'];
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="medium">
        Daily Check-in
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        How are you feeling today? This helps us adjust your fasting plan.
      </Typography>
      
      {/* Mood Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography id="mood-slider" gutterBottom>
          Mood
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ minWidth: 40 }}>
            {moodIcons[Math.floor(mood) - 1] || moodIcons[2]}
          </Box>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Slider
              value={mood}
              onChange={(e, newValue) => onMoodChange(newValue)}
              step={1}
              marks
              min={1}
              max={5}
              aria-labelledby="mood-slider"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Poor</Typography>
          <Typography variant="caption" color="text.secondary">Excellent</Typography>
        </Box>
      </Box>
      
      {/* Energy Level Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography id="energy-slider" gutterBottom>
          Energy Level
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ minWidth: 40 }}>
            {energyIcons[Math.floor(energyLevel) - 1] || energyIcons[2]}
          </Box>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Slider
              value={energyLevel}
              onChange={(e, newValue) => onEnergyChange(newValue)}
              step={1}
              marks
              min={1}
              max={5}
              aria-labelledby="energy-slider"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Low</Typography>
          <Typography variant="caption" color="text.secondary">High</Typography>
        </Box>
      </Box>
      
      {/* Hunger Level Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography id="hunger-slider" gutterBottom>
          Hunger Level
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ minWidth: 40 }}>
            <RestaurantIcon 
              fontSize="large" 
              sx={{ color: hungerColors[Math.floor(hungerLevel) - 1] || hungerColors[2] }}
            />
          </Box>
          <Box sx={{ ml: 2, flex: 1 }}>
            <Slider
              value={hungerLevel}
              onChange={(e, newValue) => onHungerChange(newValue)}
              step={1}
              marks
              min={1}
              max={5}
              aria-labelledby="hunger-slider"
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">Not Hungry</Typography>
          <Typography variant="caption" color="text.secondary">Very Hungry</Typography>
        </Box>
      </Box>
      
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        size="large"
        onClick={onSubmit}
      >
        Submit Check-in
      </Button>
    </Paper>
  );
};

export default MoodSelector;

