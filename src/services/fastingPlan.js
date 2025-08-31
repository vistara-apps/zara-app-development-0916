import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { generateFastingPlan, adjustFastingPlan } from './openai';
import { getUserProfile } from './auth';
import { getLatestCheckIn } from './checkIn';

// Create a new fasting plan
export const createFastingPlan = async (userId, userProfile) => {
  try {
    // Generate plan using OpenAI
    const plan = await generateFastingPlan(userProfile);
    
    // Save plan to Firestore
    const planRef = await addDoc(collection(db, 'users', userId, 'fastingPlans'), {
      ...plan,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    
    // Deactivate previous plans
    const plansRef = collection(db, 'users', userId, 'fastingPlans');
    const plansQuery = query(plansRef, where('isActive', '==', true));
    const plansSnapshot = await getDocs(plansQuery);
    
    const updatePromises = plansSnapshot.docs
      .filter(doc => doc.id !== planRef.id)
      .map(doc => updateDoc(doc.ref, { isActive: false }));
    
    await Promise.all(updatePromises);
    
    return { id: planRef.id, ...plan };
  } catch (error) {
    console.error('Error creating fasting plan:', error);
    throw error;
  }
};

// Get current active fasting plan
export const getCurrentFastingPlan = async (userId) => {
  try {
    const plansRef = collection(db, 'users', userId, 'fastingPlans');
    const planQuery = query(plansRef, where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(1));
    const planSnapshot = await getDocs(planQuery);
    
    if (planSnapshot.empty) {
      // No active plan, create one based on user profile
      const userProfile = await getUserProfile(userId);
      return await createFastingPlan(userId, userProfile);
    }
    
    const planDoc = planSnapshot.docs[0];
    return { id: planDoc.id, ...planDoc.data() };
  } catch (error) {
    console.error('Error getting current fasting plan:', error);
    throw error;
  }
};

// Update fasting plan based on check-in data
export const updateFastingPlan = async (userId) => {
  try {
    // Get current plan
    const currentPlan = await getCurrentFastingPlan(userId);
    
    // Get latest check-in
    const latestCheckIn = await getLatestCheckIn(userId);
    
    if (!latestCheckIn) {
      return currentPlan;
    }
    
    // Adjust plan based on check-in data
    const adjustedPlan = await adjustFastingPlan(userId, currentPlan, latestCheckIn);
    
    // Save adjusted plan
    const planRef = await addDoc(collection(db, 'users', userId, 'fastingPlans'), {
      ...adjustedPlan,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      basedOnCheckIn: latestCheckIn.id
    });
    
    // Deactivate previous plan
    await updateDoc(doc(db, 'users', userId, 'fastingPlans', currentPlan.id), {
      isActive: false
    });
    
    return { id: planRef.id, ...adjustedPlan };
  } catch (error) {
    console.error('Error updating fasting plan:', error);
    throw error;
  }
};

// Start a fasting session
export const startFastingSession = async (userId) => {
  try {
    // End any active sessions first
    await endActiveSessions(userId);
    
    // Create new session
    const sessionRef = await addDoc(collection(db, 'users', userId, 'fastingSessions'), {
      userId,
      startTime: new Date(),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: sessionRef.id, startTime: new Date(), isActive: true };
  } catch (error) {
    console.error('Error starting fasting session:', error);
    throw error;
  }
};

// End a fasting session
export const endFastingSession = async (userId, sessionId) => {
  try {
    const sessionRef = doc(db, 'users', userId, 'fastingSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const sessionData = sessionDoc.data();
    const startTime = sessionData.startTime.toDate();
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Update session
    await updateDoc(sessionRef, {
      endTime,
      isActive: false,
      durationMs,
      durationHours,
      updatedAt: serverTimestamp()
    });
    
    return {
      id: sessionId,
      startTime,
      endTime,
      durationHours,
      isActive: false
    };
  } catch (error) {
    console.error('Error ending fasting session:', error);
    throw error;
  }
};

// End all active sessions
export const endActiveSessions = async (userId) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'fastingSessions');
    const sessionsQuery = query(sessionsRef, where('isActive', '==', true));
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    const updatePromises = sessionsSnapshot.docs.map(doc => {
      const sessionData = doc.data();
      const startTime = sessionData.startTime.toDate();
      const endTime = new Date();
      const durationMs = endTime - startTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      
      return updateDoc(doc.ref, {
        endTime,
        isActive: false,
        durationMs,
        durationHours,
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error ending active sessions:', error);
    throw error;
  }
};

// Get active fasting session
export const getActiveSession = async (userId) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'fastingSessions');
    const sessionQuery = query(sessionsRef, where('isActive', '==', true), limit(1));
    const sessionSnapshot = await getDocs(sessionQuery);
    
    if (sessionSnapshot.empty) {
      return null;
    }
    
    const sessionDoc = sessionSnapshot.docs[0];
    const sessionData = sessionDoc.data();
    
    return {
      id: sessionDoc.id,
      startTime: sessionData.startTime.toDate(),
      isActive: true
    };
  } catch (error) {
    console.error('Error getting active session:', error);
    throw error;
  }
};

// Get weekly fasting stats
export const getWeeklyFastingStats = async (userId) => {
  try {
    // Get sessions from the past week
    const sessionsRef = collection(db, 'users', userId, 'fastingSessions');
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', oneWeekAgo),
      orderBy('startTime', 'desc')
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    if (sessionsSnapshot.empty) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalHours: 0,
        averageDuration: 0,
        currentStreak: 0,
        longestStreak: 0,
        fastingScore: 0
      };
    }
    
    // Calculate stats
    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        startTime: data.startTime.toDate(),
        endTime: data.endTime?.toDate() || null,
        durationHours: data.durationHours || 0,
        isActive: data.isActive
      };
    });
    
    const completedSessions = sessions.filter(session => !session.isActive && session.durationHours >= 12);
    const totalHours = completedSessions.reduce((sum, session) => sum + session.durationHours, 0);
    const averageDuration = completedSessions.length > 0 ? totalHours / completedSessions.length : 0;
    
    // Calculate streak
    const currentStreak = calculateCurrentStreak(sessions);
    const longestStreak = calculateLongestStreak(sessions);
    
    // Calculate fasting score (0-100)
    const targetHoursPerDay = 16;
    const targetDaysPerWeek = 7;
    const actualHoursPerDay = totalHours / 7;
    const actualDaysPerWeek = completedSessions.length;
    
    const hoursScore = Math.min(100, (actualHoursPerDay / targetHoursPerDay) * 100);
    const daysScore = Math.min(100, (actualDaysPerWeek / targetDaysPerWeek) * 100);
    const fastingScore = Math.round((hoursScore * 0.6) + (daysScore * 0.4));
    
    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalHours,
      averageDuration,
      currentStreak,
      longestStreak,
      fastingScore
    };
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    throw error;
  }
};

// Get monthly fasting data for charts
export const getMonthlyFastingData = async (userId, days = 30) => {
  try {
    // Get sessions from the past month
    const sessionsRef = collection(db, 'users', userId, 'fastingSessions');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sessionsQuery = query(
      sessionsRef,
      where('startTime', '>=', startDate),
      orderBy('startTime', 'asc')
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    if (sessionsSnapshot.empty) {
      return {
        labels: [],
        fastingHours: []
      };
    }
    
    // Group sessions by day
    const sessionsByDay = {};
    
    sessionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const startTime = data.startTime.toDate();
      const dateStr = startTime.toISOString().split('T')[0];
      
      if (!sessionsByDay[dateStr]) {
        sessionsByDay[dateStr] = [];
      }
      
      sessionsByDay[dateStr].push({
        id: doc.id,
        startTime,
        endTime: data.endTime?.toDate() || null,
        durationHours: data.durationHours || 0,
        isActive: data.isActive
      });
    });
    
    // Create data arrays for chart
    const labels = [];
    const fastingHours = [];
    
    // Fill in data for each day
    const currentDate = new Date(startDate);
    const endDate = new Date();
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayOfMonth = currentDate.getDate();
      const label = `${dayName} ${dayOfMonth}`;
      
      labels.push(label);
      
      const daySessions = sessionsByDay[dateStr] || [];
      const dayHours = daySessions.reduce((sum, session) => {
        if (!session.isActive && session.durationHours) {
          return sum + session.durationHours;
        }
        return sum;
      }, 0);
      
      fastingHours.push(dayHours);
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      labels,
      fastingHours
    };
  } catch (error) {
    console.error('Error getting monthly fasting data:', error);
    throw error;
  }
};

// Get fasting history
export const getFastingHistory = async (userId, limit = 10) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'fastingSessions');
    const sessionsQuery = query(
      sessionsRef,
      where('isActive', '==', false),
      orderBy('startTime', 'desc'),
      limit(limit)
    );
    
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    return sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        startTime: data.startTime.toDate(),
        endTime: data.endTime.toDate(),
        durationHours: data.durationHours,
        isActive: false
      };
    });
  } catch (error) {
    console.error('Error getting fasting history:', error);
    throw error;
  }
};

// Helper function to calculate current streak
const calculateCurrentStreak = (sessions) => {
  // Sort sessions by start time (newest first)
  const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Check if there's an active session today
  const hasActiveSession = sortedSessions.some(session => 
    session.isActive && isSameDay(session.startTime, new Date())
  );
  
  // Check if there's a completed session today
  const hasCompletedSessionToday = sortedSessions.some(session => 
    !session.isActive && 
    session.durationHours >= 12 && 
    isSameDay(session.startTime, new Date())
  );
  
  // If there's an active or completed session today, start streak at 1
  if (hasActiveSession || hasCompletedSessionToday) {
    streak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Check previous days
  while (true) {
    const sessionsOnDay = sortedSessions.filter(session => 
      !session.isActive && 
      session.durationHours >= 12 && 
      isSameDay(session.startTime, currentDate)
    );
    
    if (sessionsOnDay.length === 0) {
      break;
    }
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};

// Helper function to calculate longest streak
const calculateLongestStreak = (sessions) => {
  // Group sessions by day
  const sessionsByDay = {};
  
  sessions.forEach(session => {
    if (!session.isActive && session.durationHours >= 12) {
      const dateStr = session.startTime.toISOString().split('T')[0];
      
      if (!sessionsByDay[dateStr]) {
        sessionsByDay[dateStr] = [];
      }
      
      sessionsByDay[dateStr].push(session);
    }
  });
  
  // Sort days
  const sortedDays = Object.keys(sessionsByDay).sort();
  
  if (sortedDays.length === 0) {
    return 0;
  }
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    
    // Check if days are consecutive
    prevDate.setDate(prevDate.getDate() + 1);
    
    if (isSameDay(prevDate, currDate)) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  return Math.max(longestStreak, currentStreak);
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

