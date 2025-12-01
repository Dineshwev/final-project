import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  applyActionCode,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, firestore, storage } from '../firebase';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

// Helper function to delete user data from Firestore and Storage
const deleteUserData = async (userId) => {
  try {
    // Delete user profile
    await deleteDoc(doc(firestore, 'users', userId));

    // Delete user's scans
    const scansQuery = query(collection(firestore, 'scans'), where('userId', '==', userId));
    const scansSnapshot = await getDocs(scansQuery);
    for (const scanDoc of scansSnapshot.docs) {
      await deleteDoc(scanDoc.ref);
    }

    // Delete user's reports
    const reportsQuery = query(collection(firestore, 'reports'), where('userId', '==', userId));
    const reportsSnapshot = await getDocs(reportsQuery);
    for (const reportDoc of reportsSnapshot.docs) {
      await deleteDoc(reportDoc.ref);
    }

    // Delete user's API keys
    await deleteDoc(doc(firestore, 'apiKeys', userId));

    // Delete user's settings
    await deleteDoc(doc(firestore, 'settings', userId));

    // Delete user's files from Storage
    const userStorageRef = ref(storage, `users/${userId}`);
    const userFiles = await listAll(userStorageRef);
    await Promise.all(userFiles.items.map(fileRef => deleteObject(fileRef)));

    // Delete profile picture if exists
    const profilePicRef = ref(storage, `profile_pics/${userId}`);
    try {
      await deleteObject(profilePicRef);
    } catch (error) {
      // Ignore if profile picture doesn't exist
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw new Error('Failed to delete user data');
  }
};

// Sign up with email and password
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { user: null, error: error.message };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Delete user account
export const deleteUserAccount = async (password) => {
  const user = getCurrentUser();
  if (!user) {
    return { error: 'No user logged in' };
  }

  try {
    // Re-authenticate user before deletion if they signed in with email/password
    if (user.providerData[0].providerId === 'password') {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    }

    // Delete user data from Firestore
    await deleteUserData(user.uid);

    // Delete the user's Firebase account
    await user.delete();
    return { error: null };
  } catch (error) {
    console.error('Delete account error:', error);
    return { error: error.message };
  }
};

// Get auth token
export const getAuthToken = async () => {
  const user = getCurrentUser();
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }
  return null;
};

// Send email verification
export const sendVerificationEmail = async () => {
  const user = getCurrentUser();
  if (user && !user.emailVerified) {
    try {
      await sendEmailVerification(user);
      return { error: null };
    } catch (error) {
      console.error('Email verification error:', error);
      return { error: error.message };
    }
  }
  return { error: 'User not found or already verified' };
};

// Verify email with code
export const verifyEmail = async (actionCode) => {
  try {
    await applyActionCode(auth, actionCode);
    return { error: null };
  } catch (error) {
    console.error('Email verification error:', error);
    return { error: error.message };
  }
};