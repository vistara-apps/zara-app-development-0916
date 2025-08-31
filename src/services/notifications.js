import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Request notification permissions
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      return { status: 'unsupported', permission: null };
    }
    
    const permission = await Notification.requestPermission();
    return { status: 'success', permission };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { status: 'error', error: error.message };
  }
};

// Save notification settings
export const saveNotificationSettings = async (userId, settings) => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    
    // Check if settings document exists
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Create new settings document
      await setDoc(settingsRef, {
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update existing settings
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    }
    
    return settings;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
};

// Get notification settings
export const getNotificationSettings = async (userId) => {
  try {
    const settingsRef = doc(db, 'users', userId, 'settings', 'notifications');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Return default settings
      return {
        enabled: false,
        fastingStart: true,
        fastingEnd: true,
        dailyCheckIn: true,
        weeklyReport: true,
        customTimes: []
      };
    }
    
    return settingsDoc.data();
  } catch (error) {
    console.error('Error getting notification settings:', error);
    throw error;
  }
};

// Schedule a notification
export const scheduleNotification = async (userId, notification) => {
  try {
    // In a real implementation, this would use a service worker
    // and possibly a server-side function to schedule notifications
    // For this demo, we'll just mock the functionality
    
    console.log('Scheduling notification:', notification);
    
    // Return a mock notification ID
    return {
      id: `notification_${Date.now()}`,
      ...notification
    };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
};

// Cancel a notification
export const cancelNotification = async (notificationId) => {
  try {
    // In a real implementation, this would cancel a scheduled notification
    // For this demo, we'll just mock the functionality
    
    console.log('Canceling notification:', notificationId);
    
    return true;
  } catch (error) {
    console.error('Error canceling notification:', error);
    throw error;
  }
};

// Send a test notification
export const sendTestNotification = async (title, body) => {
  try {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }
    
    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }
    
    const notification = new Notification(title, {
      body,
      icon: '/logo192.png'
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
};

