import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Save a daily check-in
export const saveCheckIn = async (userId, checkInData) => {
  try {
    const checkInRef = await addDoc(collection(db, 'users', userId, 'checkIns'), {
      ...checkInData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: checkInRef.id, ...checkInData };
  } catch (error) {
    console.error('Error saving check-in:', error);
    throw error;
  }
};

// Get the latest check-in
export const getLatestCheckIn = async (userId) => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    const checkInQuery = query(checkInsRef, orderBy('date', 'desc'), limit(1));
    const checkInSnapshot = await getDocs(checkInQuery);
    
    if (checkInSnapshot.empty) {
      return null;
    }
    
    const checkInDoc = checkInSnapshot.docs[0];
    const checkInData = checkInDoc.data();
    
    return {
      id: checkInDoc.id,
      mood: checkInData.mood,
      energyLevel: checkInData.energyLevel,
      hungerLevel: checkInData.hungerLevel,
      date: checkInData.date.toDate()
    };
  } catch (error) {
    console.error('Error getting latest check-in:', error);
    throw error;
  }
};

// Check if user has checked in today
export const hasCheckedInToday = async (userId) => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date (start of day)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Query for check-ins from today
    const checkInQuery = query(
      checkInsRef,
      where('date', '>=', today),
      where('date', '<', tomorrow)
    );
    
    const checkInSnapshot = await getDocs(checkInQuery);
    
    return !checkInSnapshot.empty;
  } catch (error) {
    console.error('Error checking if user has checked in today:', error);
    throw error;
  }
};

// Get check-in history
export const getCheckInHistory = async (userId, limit = 10) => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    const checkInQuery = query(checkInsRef, orderBy('date', 'desc'), limit(limit));
    const checkInSnapshot = await getDocs(checkInQuery);
    
    return checkInSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        mood: data.mood,
        energyLevel: data.energyLevel,
        hungerLevel: data.hungerLevel,
        date: data.date.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting check-in history:', error);
    throw error;
  }
};

// Get mood and energy trend data for charts
export const getMoodAndEnergyTrend = async (userId, timeRange = 'week') => {
  try {
    const checkInsRef = collection(db, 'users', userId, 'checkIns');
    
    // Determine date range
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeRange === 'quarter') {
      startDate.setDate(startDate.getDate() - 90);
    }
    
    // Query for check-ins in the date range
    const checkInQuery = query(
      checkInsRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const checkInSnapshot = await getDocs(checkInQuery);
    
    if (checkInSnapshot.empty) {
      return null;
    }
    
    // Group check-ins by day
    const checkInsByDay = {};
    
    checkInSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date.toDate();
      const dateStr = date.toISOString().split('T')[0];
      
      if (!checkInsByDay[dateStr]) {
        checkInsByDay[dateStr] = [];
      }
      
      checkInsByDay[dateStr].push({
        id: doc.id,
        mood: data.mood,
        energyLevel: data.energyLevel,
        hungerLevel: data.hungerLevel,
        date
      });
    });
    
    // Create data arrays for chart
    const labels = [];
    const moodData = [];
    const energyData = [];
    
    // Fill in data for each day
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayOfMonth = currentDate.getDate();
      const label = `${dayName} ${dayOfMonth}`;
      
      labels.push(label);
      
      const dayCheckIns = checkInsByDay[dateStr] || [];
      
      if (dayCheckIns.length > 0) {
        // Calculate average mood and energy for the day
        const avgMood = dayCheckIns.reduce((sum, checkIn) => sum + checkIn.mood, 0) / dayCheckIns.length;
        const avgEnergy = dayCheckIns.reduce((sum, checkIn) => sum + checkIn.energyLevel, 0) / dayCheckIns.length;
        
        moodData.push(avgMood);
        energyData.push(avgEnergy);
      } else {
        // No check-ins for this day
        moodData.push(null);
        energyData.push(null);
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Mood',
          data: moodData,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
        },
        {
          label: 'Energy',
          data: energyData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
        }
      ]
    };
  } catch (error) {
    console.error('Error getting mood and energy trend:', error);
    throw error;
  }
};

