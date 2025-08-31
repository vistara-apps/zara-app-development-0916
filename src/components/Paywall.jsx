import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getFeatureComparison } from '../utils/featureAccess';

const Paywall = ({ onSubscribe, onClose }) => {
  // Get feature comparison data
  const features = getFeatureComparison();
  
  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        Upgrade to Premium
      </Typography>
      
      <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Unlock advanced features and get the most out of your fasting journey
      </Typography>
      
      <Grid container spacing={4}>
        {/* Free Plan */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight="medium">
              Free
            </Typography>
            
            <Typography variant="h4" gutterBottom fontWeight="bold">
              $0
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                forever
              </Typography>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Basic fasting tracking and daily check-ins
            </Typography>
            
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth 
              sx={{ mb: 3 }}
              disabled
            >
              Current Plan
            </Button>
            
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              {features.map((feature, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {feature.free === 'Yes' ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <CancelIcon color="disabled" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature.feature} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      color: feature.free === 'Yes' ? 'text.primary' : 'text.disabled'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Premium Plan */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'primary.main',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 12, 
                right: -30, 
                transform: 'rotate(45deg)',
                bgcolor: 'primary.main',
                color: 'white',
                py: 0.5,
                px: 4,
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              RECOMMENDED
            </Box>
            
            <Typography variant="h5" gutterBottom fontWeight="medium">
              Premium
            </Typography>
            
            <Typography variant="h4" gutterBottom fontWeight="bold">
              $4.99
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                per month
              </Typography>
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Advanced features for serious fasting enthusiasts
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mb: 3 }}
              onClick={onSubscribe}
            >
              Upgrade Now
            </Button>
            
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
              {features.map((feature, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {feature.premium === 'Yes' && (
                      <CheckCircleIcon color="success" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={feature.feature} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: feature.free === 'No' && feature.premium === 'Yes' ? 'bold' : 'regular'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button color="inherit" onClick={onClose}>
          Maybe Later
        </Button>
      </Box>
    </Paper>
  );
};

export default Paywall;

