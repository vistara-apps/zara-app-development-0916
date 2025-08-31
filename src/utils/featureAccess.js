// Feature access utility functions

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

// Check if a feature is available for a subscription tier
export const isFeatureAvailable = (featureName, tier) => {
  const featureMap = {
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
  
  if (featureMap[featureName]) {
    return featureMap[featureName].includes(tier);
  }
  
  return false;
};

// Get premium features
export const getPremiumFeatures = () => {
  return [
    {
      name: 'Voice Journal',
      description: 'Record your thoughts and feelings about your fasting experience with voice notes that are automatically transcribed.',
      icon: 'mic'
    },
    {
      name: 'Advanced Analytics',
      description: 'Get detailed insights into your fasting patterns, including correlations between fasting duration and mood/energy levels.',
      icon: 'analytics'
    },
    {
      name: 'Weekly Fasting Score',
      description: 'Receive a personalized score that measures your fasting consistency and progress toward your goals.',
      icon: 'score'
    },
    {
      name: 'Personalized Recommendations',
      description: 'Get AI-powered recommendations to optimize your fasting schedule based on your unique data and goals.',
      icon: 'recommend'
    },
    {
      name: 'Custom Fasting Protocols',
      description: 'Create and save custom fasting protocols beyond the standard options, tailored to your specific needs.',
      icon: 'custom'
    },
    {
      name: 'Data Export',
      description: 'Export your fasting data and insights to CSV or PDF for sharing with healthcare providers or personal analysis.',
      icon: 'export'
    }
  ];
};

// Get subscription pricing
export const getSubscriptionPricing = () => {
  return {
    free: {
      price: 0,
      period: 'forever',
      features: ['Basic Fasting Timer', 'Daily Check-in', 'Basic Progress Tracking']
    },
    premium: {
      price: 4.99,
      period: 'month',
      features: ['All Free Features', 'Voice Journal', 'Advanced Analytics', 'Weekly Fasting Score', 'Personalized Recommendations', 'Custom Fasting Protocols', 'Data Export']
    }
  };
};

