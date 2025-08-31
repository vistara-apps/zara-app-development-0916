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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { transcribeVoiceJournal } from './openai';

// Save a journal entry
export const saveJournalEntry = async (userId, { audioBlob, transcription, date }) => {
  try {
    // Upload audio file to Firebase Storage
    const audioRef = ref(storage, `users/${userId}/journal/${date.getTime()}.webm`);
    await uploadBytes(audioRef, audioBlob);
    const audioUrl = await getDownloadURL(audioRef);
    
    // Save journal entry to Firestore
    const journalRef = await addDoc(collection(db, 'users', userId, 'journalEntries'), {
      userId,
      audioUrl,
      transcription,
      date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { 
      id: journalRef.id, 
      audioUrl, 
      transcription, 
      date 
    };
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

// Get journal entries
export const getJournalEntries = async (userId, limit = 10) => {
  try {
    const journalRef = collection(db, 'users', userId, 'journalEntries');
    const journalQuery = query(journalRef, orderBy('date', 'desc'), limit(limit));
    const journalSnapshot = await getDocs(journalQuery);
    
    return journalSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        audioUrl: data.audioUrl,
        transcription: data.transcription,
        date: data.date.toDate()
      };
    });
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

// Get a specific journal entry
export const getJournalEntry = async (userId, entryId) => {
  try {
    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    const entryDoc = await getDoc(entryRef);
    
    if (!entryDoc.exists()) {
      return null;
    }
    
    const data = entryDoc.data();
    
    return {
      id: entryDoc.id,
      audioUrl: data.audioUrl,
      transcription: data.transcription,
      date: data.date.toDate()
    };
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (userId, entryId) => {
  try {
    // Get the entry to get the audio URL
    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    const entryDoc = await getDoc(entryRef);
    
    if (!entryDoc.exists()) {
      throw new Error('Journal entry not found');
    }
    
    const data = entryDoc.data();
    
    // Delete the audio file from Storage
    if (data.audioUrl) {
      const audioRef = ref(storage, data.audioUrl);
      await deleteObject(audioRef);
    }
    
    // Delete the entry from Firestore
    await deleteDoc(entryRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

