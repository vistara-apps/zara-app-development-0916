import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, Button, Alert } from '@mui/material';
import MoodSelector from '../components/MoodSelector';
import VoiceRecorder from '../components/VoiceRecorder';
import { useAuth } from '../contexts/AuthContext';
import { 
  saveCheckIn, 
  getLatestCheckIn,
  hasCheckedInToday
} from '../services/checkIn';
import { saveJournalEntry } from '../services/journal';
import { useNavigate } from 'react-router-dom';

const CheckInPage = () => {
  const { currentUser, isPremium } = useAuth();
  const navigate = useNavigate();
  
  const [mood, setMood] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [hungerLevel, setHungerLevel] = useState(3);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user has already checked in today
  useEffect(() => {
    const checkStatus = async () => {
      if (currentUser) {
        try {
          const checkedIn = await hasCheckedInToday(currentUser.uid);
          setHasCheckedIn(checkedIn);
          
          // If user has checked in, get the latest check-in data
          if (checkedIn) {
            const latestCheckIn = await getLatestCheckIn(currentUser.uid);
            if (latestCheckIn) {
              setMood(latestCheckIn.mood || 3);
              setEnergyLevel(latestCheckIn.energyLevel || 3);
              setHungerLevel(latestCheckIn.hungerLevel || 3);
            }
          }
        } catch (error) {
          console.error('Error checking check-in status:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkStatus();
  }, [currentUser]);
  
  // Handle check-in submission
  const handleSubmitCheckIn = async () => {
    if (!currentUser) return;
    
    try {
      await saveCheckIn(currentUser.uid, {
        mood,
        energyLevel,
        hungerLevel,
        date: new Date(),
      });
      
      setSuccess(true);
      setHasCheckedIn(true);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };
  
  // Handle journal entry submission
  const handleSaveJournal = async (audioBlob, transcription) => {
    if (!currentUser || !isPremium) return;
    
    try {
      await saveJournalEntry(currentUser.uid, {
        audioBlob,
        transcription,
        date: new Date(),
      });
      
      // Show success message
      setSuccess(true);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };
  
  // Handle upgrade to premium
  const handleUpgrade = () => {
    navigate('/settings');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 4 }}>
          Successfully saved your check-in data!
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Daily Check-in
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your mood and energy levels to help us adjust your fasting plan.
            </Typography>
          </Box>
          
          <MoodSelector 
            mood={mood}
            energyLevel={energyLevel}
            hungerLevel={hungerLevel}
            onMoodChange={setMood}
            onEnergyChange={setEnergyLevel}
            onHungerChange={setHungerLevel}
            onSubmit={handleSubmitCheckIn}
          />
          
          {hasCheckedIn && (
            <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Today's Check-in Complete
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Thank you for checking in today! Your fasting plan will be adjusted based on your feedback.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/timer')}
                >
                  Go to Timer
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Box sx={{ mb: 4, mt: { xs: 0, md: 10 } }}>
            <VoiceRecorder 
              isPremium={isPremium}
              onSave={handleSaveJournal}
              onUpgrade={handleUpgrade}
            />
          </Box>
          
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Why Check In Daily?
            </Typography>
            <Typography variant="body2" paragraph>
              Daily check-ins help our AI understand how fasting affects your mood and energy levels.
            </Typography>
            <Typography variant="body2" paragraph>
              Based on your feedback, we can adjust your fasting schedule to optimize for your goals and make your fasting journey more effective and enjoyable.
            </Typography>
            <Typography variant="body2">
              Premium users also get personalized recommendations based on their check-in data.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckInPage;

