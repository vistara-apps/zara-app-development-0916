import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Get user subscription
export const getUserSubscription = async (userId) => {
  try {
    const subscriptionRef = doc(db, 'users', userId, 'subscription', 'current');
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      // Create a free subscription if none exists
      await setDoc(subscriptionRef, {
        userId,
        tier: 'free',
        startDate: new Date(),
        endDate: null,
        autoRenew: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        tier: 'free',
        startDate: new Date(),
        endDate: null,
        autoRenew: false
      };
    }
    
    const data = subscriptionDoc.data();
    
    return {
      tier: data.tier,
      startDate: data.startDate.toDate(),
      endDate: data.endDate ? data.endDate.toDate() : null,
      autoRenew: data.autoRenew
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
};

// Upgrade to premium subscription
export const upgradeToPremium = async (userId) => {
  try {
    const subscriptionRef = doc(db, 'users', userId, 'subscription', 'current');
    
    // Set end date to 1 month from now
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    await updateDoc(subscriptionRef, {
      tier: 'premium',
      startDate: new Date(),
      endDate,
      autoRenew: true,
      updatedAt: serverTimestamp()
    });
    
    return {
      tier: 'premium',
      startDate: new Date(),
      endDate,
      autoRenew: true
    };
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    throw error;
  }
};

// Cancel premium subscription
export const cancelPremium = async (userId) => {
  try {
    const subscriptionRef = doc(db, 'users', userId, 'subscription', 'current');
    
    await updateDoc(subscriptionRef, {
      autoRenew: false,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error canceling premium subscription:', error);
    throw error;
  }
};

// Check if a feature is available for the user's subscription tier
export const isFeatureAvailable = async (userId, featureName) => {
  try {
    const subscription = await getUserSubscription(userId);
    
    // Get feature access map
    const featureAccess = getFeatureAccessMap();
    
    // Check if feature exists and is available for the user's tier
    if (featureAccess[featureName]) {
      return featureAccess[featureName].includes(subscription.tier);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking feature availability:', error);
    throw error;
  }
};

// Get feature access map
export const getFeatureAccessMap = () => {
  return {
    'basic_fasting_timer': ['free', 'premium'],
    'daily_checkin': ['free', 'premium'],
    'basic_progress_tracking': ['free', 'premium'],
    'voice_journal': ['premium'],
    'advanced_analytics': ['premium'],
    'weekly_fasting_score': ['premium'],
    'personalized_recommendations': ['premium'],
    'custom_fasting_protocols': ['premium'],
    'data_export': ['premium']
  };
};

// Get feature comparison for subscription tiers
export const getFeatureComparison = () => {
  return [
    { feature: 'Basic Fasting Timer', free: 'Yes', premium: 'Yes' },
    { feature: 'Daily Check-in', free: 'Yes', premium: 'Yes' },
    { feature: 'Basic Progress Tracking', free: 'Yes', premium: 'Yes' },
    { feature: 'Voice Journal', free: 'No', premium: 'Yes' },
    { feature: 'Advanced Analytics', free: 'No', premium: 'Yes' },
    { feature: 'Weekly Fasting Score', free: 'No', premium: 'Yes' },
    { feature: 'Personalized Recommendations', free: 'No', premium: 'Yes' },
    { feature: 'Custom Fasting Protocols', free: 'No', premium: 'Yes' },
    { feature: 'Data Export', free: 'No', premium: 'Yes' }
  ];
};

