import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

// Register a new user
export const registerUser = async (email, password, displayName) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateFirebaseProfile(user, { displayName });
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingCompleted: false
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Save user profile
export const saveUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update profile with timestamp
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    // Get updated profile
    const updatedProfile = await getUserProfile(userId);
    return updatedProfile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (userId, file) => {
  try {
    // Create storage reference
    const storageRef = ref(storage, `users/${userId}/profile.jpg`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const photoURL = await getDownloadURL(storageRef);
    
    // Update user profile
    await updateFirebaseProfile(auth.currentUser, { photoURL });
    
    // Update Firestore profile
    await updateDoc(doc(db, 'users', userId), {
      photoURL,
      updatedAt: serverTimestamp()
    });
    
    return photoURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

// Complete onboarding
export const completeOnboarding = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update user profile with onboarding data
    await updateDoc(userRef, {
      ...userData,
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
};

// Check if onboarding is completed
export const isOnboardingCompleted = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      return userDoc.data().onboardingCompleted === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw error;
  }
};

