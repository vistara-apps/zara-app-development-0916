import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

// Initialize Firebase Functions
const functions = getFunctions(app);

// Generate fasting plan based on user profile
export const generateFastingPlan = async (userProfile) => {
  try {
    // In a real implementation, this would call a Firebase Function
    // that securely communicates with the OpenAI API
    // For this demo, we'll mock the response
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract relevant user data
    const { 
      age, 
      gender, 
      weight, 
      height,
      goal,
      sleepTime,
      wakeTime,
      activityLevel,
      dietaryRestrictions = [],
      healthConditions = []
    } = userProfile;
    
    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // Determine appropriate fasting protocol based on user data
    let protocol;
    let fastingHours;
    let eatingHours;
    
    if (goal === 'fat_loss' && bmi > 25) {
      protocol = '16:8 Intermittent Fasting';
      fastingHours = 16;
      eatingHours = 8;
    } else if (goal === 'fat_loss') {
      protocol = '14:10 Intermittent Fasting';
      fastingHours = 14;
      eatingHours = 10;
    } else if (goal === 'energy') {
      protocol = '12:12 Intermittent Fasting';
      fastingHours = 12;
      eatingHours = 12;
    } else if (goal === 'gut_health') {
      protocol = '16:8 Intermittent Fasting';
      fastingHours = 16;
      eatingHours = 8;
    } else {
      protocol = '14:10 Intermittent Fasting';
      fastingHours = 14;
      eatingHours = 10;
    }
    
    // Adjust for age
    if (age > 60) {
      fastingHours = Math.max(12, fastingHours - 2);
      eatingHours = 24 - fastingHours;
    }
    
    // Adjust for activity level
    if (activityLevel === 'very_active') {
      fastingHours = Math.max(12, fastingHours - 2);
      eatingHours = 24 - fastingHours;
    }
    
    // Calculate fasting and eating windows based on wake time
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    const wakeMinute = parseInt(wakeTime.split(':')[1]);
    
    // Start eating window 1-2 hours after waking up
    const eatingStartHour = (wakeHour + 1) % 24;
    const eatingStartTime = `${eatingStartHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
    
    // Calculate eating end time
    const eatingEndHour = (eatingStartHour + eatingHours) % 24;
    const eatingEndTime = `${eatingEndHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
    
    // Calculate fasting start and end times
    const fastingStartTime = eatingEndTime;
    const fastingEndTime = eatingStartTime;
    
    // Generate recommendations based on user profile
    const recommendations = [];
    
    if (goal === 'fat_loss') {
      recommendations.push('Focus on protein-rich foods during your eating window');
      recommendations.push('Stay hydrated during fasting periods with water, black coffee, or tea');
      recommendations.push('Consider light exercise like walking during fasted state for enhanced fat burning');
    } else if (goal === 'energy') {
      recommendations.push('Break your fast with a balanced meal containing healthy fats and protein');
      recommendations.push('Avoid high-carb meals right before fasting to prevent energy crashes');
      recommendations.push('Consider taking electrolytes during longer fasting periods');
    } else if (goal === 'gut_health') {
      recommendations.push('Include fermented foods like yogurt, kefir, or sauerkraut in your eating window');
      recommendations.push('Stay well-hydrated during fasting periods');
      recommendations.push('Consider bone broth to break your fast for gut lining support');
    }
    
    // Add general recommendations
    recommendations.push('Avoid sugary drinks and snacks during your eating window');
    recommendations.push('Listen to your body and adjust your fasting schedule if needed');
    
    // Return the fasting plan
    return {
      protocol,
      fastingHours,
      eatingHours,
      fastingWindow: {
        start: fastingStartTime,
        end: fastingEndTime
      },
      eatingWindow: {
        start: eatingStartTime,
        end: eatingEndTime
      },
      recommendations,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating fasting plan:', error);
    throw error;
  }
};

// Adjust fasting plan based on check-in data
export const adjustFastingPlan = async (userId, currentPlan, checkInData) => {
  try {
    // In a real implementation, this would call a Firebase Function
    // For this demo, we'll mock the response
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract check-in data
    const { mood, energyLevel, hungerLevel } = checkInData;
    
    // Clone current plan
    const adjustedPlan = { ...currentPlan };
    
    // Adjust fasting hours based on check-in data
    if (energyLevel <= 2 && hungerLevel >= 4) {
      // User is experiencing low energy and high hunger
      adjustedPlan.fastingHours = Math.max(12, currentPlan.fastingHours - 2);
      adjustedPlan.eatingHours = 24 - adjustedPlan.fastingHours;
      adjustedPlan.recommendations.push('We\'ve reduced your fasting window due to low energy levels');
    } else if (energyLevel >= 4 && hungerLevel <= 2) {
      // User is experiencing high energy and low hunger
      adjustedPlan.fastingHours = Math.min(18, currentPlan.fastingHours + 1);
      adjustedPlan.eatingHours = 24 - adjustedPlan.fastingHours;
      adjustedPlan.recommendations.push('We\'ve slightly increased your fasting window as you\'re adapting well');
    }
    
    // Update protocol name if hours changed
    adjustedPlan.protocol = `${adjustedPlan.fastingHours}:${adjustedPlan.eatingHours} Intermittent Fasting`;
    
    // Recalculate windows based on current eating start time
    const eatingStartHour = parseInt(currentPlan.eatingWindow.start.split(':')[0]);
    const eatingStartMinute = parseInt(currentPlan.eatingWindow.start.split(':')[1]);
    
    // Calculate eating end time
    const eatingEndHour = (eatingStartHour + adjustedPlan.eatingHours) % 24;
    const eatingEndTime = `${eatingEndHour.toString().padStart(2, '0')}:${eatingStartMinute.toString().padStart(2, '0')}`;
    
    // Update windows
    adjustedPlan.eatingWindow = {
      start: currentPlan.eatingWindow.start,
      end: eatingEndTime
    };
    
    adjustedPlan.fastingWindow = {
      start: eatingEndTime,
      end: currentPlan.eatingWindow.start
    };
    
    // Add personalized recommendations based on check-in
    if (mood <= 2) {
      adjustedPlan.recommendations.push('Consider adding mood-boosting foods like fatty fish, dark chocolate, or bananas to your diet');
    }
    
    if (energyLevel <= 2) {
      adjustedPlan.recommendations.push('Try breaking your fast with a protein-rich meal to stabilize energy levels');
    }
    
    // Update timestamps
    adjustedPlan.updatedAt = new Date();
    
    return adjustedPlan;
  } catch (error) {
    console.error('Error adjusting fasting plan:', error);
    throw error;
  }
};

// Transcribe voice journal
export const transcribeVoiceJournal = async (audioBlob) => {
  try {
    // In a real implementation, this would upload the audio to Firebase Storage
    // and then call a Firebase Function that uses OpenAI's Whisper API
    // For this demo, we'll mock the response
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transcription
    return "Today I completed my 16-hour fast and I'm feeling really good. I had more energy than usual and was able to focus better at work. I did feel a bit hungry around hour 14, but drinking some water helped. Looking forward to continuing this fasting schedule.";
  } catch (error) {
    console.error('Error transcribing voice journal:', error);
    throw error;
  }
};

