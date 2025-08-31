import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';

const VoiceRecorder = ({ 
  isPremium = false, 
  onSave, 
  onUpgrade 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioElement, setAudioElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  // Mock MediaRecorder
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.pause();
      };
    }
  }, [audioUrl]);
  
  // Recording timer
  useEffect(() => {
    let interval = null;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);
  
  // Format recording time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Start recording
  const startRecording = async () => {
    if (!isPremium) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscription('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Mock transcription after a delay
      setIsLoading(true);
      setTimeout(() => {
        setTranscription(
          "Today I completed my 16-hour fast and I'm feeling really good. I had more energy than usual and was able to focus better at work. I did feel a bit hungry around hour 14, but drinking some water helped. Looking forward to continuing this fasting schedule."
        );
        setIsLoading(false);
      }, 2000);
    }
  };
  
  // Play/pause audio
  const togglePlayback = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Delete recording
  const deleteRecording = () => {
    if (audioElement) {
      audioElement.pause();
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setTranscription('');
  };
  
  // Save recording
  const handleSave = () => {
    if (onSave && audioBlob) {
      onSave(audioBlob, transcription);
      deleteRecording();
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="medium">
        Voice Journal
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Record your thoughts about your fasting experience.
      </Typography>
      
      {!isPremium ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <LockIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Premium Feature
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Voice journaling is available for premium users only.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onUpgrade}
          >
            Upgrade to Premium
          </Button>
        </Box>
      ) : (
        <>
          {/* Recording UI */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {isRecording ? (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress size={80} />
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
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {formatTime(recordingTime)}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<StopIcon />}
                  onClick={stopRecording}
                >
                  Stop
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<MicIcon />}
                onClick={startRecording}
                disabled={!!audioBlob}
              >
                Start Recording
              </Button>
            )}
          </Box>
          
          {/* Playback UI */}
          {audioUrl && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <IconButton onClick={togglePlayback} color="primary">
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton onClick={deleteRecording} color="error">
                  <DeleteIcon />
                </IconButton>
                <IconButton onClick={handleSave} color="success" disabled={!transcription}>
                  <SaveIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  transcription && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Transcription:
                      </Typography>
                      <Typography variant="body2">
                        {transcription}
                      </Typography>
                    </>
                  )
                )}
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default VoiceRecorder;

