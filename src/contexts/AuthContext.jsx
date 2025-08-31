import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { auth } from '../firebase';
import { getUserProfile } from '../services/auth';
import { getUserSubscription } from '../services/subscription';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Logout function
  const logout = () => {
    return signOut(auth);
  };
  
  // Update user profile
  const updateProfile = async (userId, profileData) => {
    try {
      // Update profile in Firestore
      const updatedProfile = await saveUserProfile(userId, profileData);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user profile
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Get user subscription
          const sub = await getUserSubscription(user.uid);
          setSubscription(sub);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserProfile(null);
        setSubscription(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // Context value
  const value = {
    currentUser,
    userProfile,
    subscription,
    isPremium: subscription?.tier === 'premium',
    logout,
    updateProfile,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

