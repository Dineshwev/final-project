// src/services/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const authService = {
  // Register a new user
  register: async (email: string, password: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user profile with display name if provided
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });
      }

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Google sign-in
  loginWithGoogle: async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      // Add scopes if needed
      googleProvider.addScope("https://www.googleapis.com/auth/userinfo.email");
      googleProvider.addScope(
        "https://www.googleapis.com/auth/userinfo.profile"
      );

      // You can use either popup or redirect method
      // Popup is generally easier to implement and doesn't navigate away from your page
      const result = await signInWithPopup(auth, googleProvider);

      // This gives you a Google Access Token that you can use to access the Google API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info
      const user = result.user;

      return { success: true, user, token };
    } catch (error: any) {
      // Handle specific Google Auth errors here
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used
      const email = error.customData?.email || "";
      // The AuthCredential type that was used
      const credential = GoogleAuthProvider.credentialFromError(error);

      console.error("Google sign in error:", {
        errorCode,
        errorMessage,
        email,
        credential,
      });

      return {
        success: false,
        error: errorMessage,
        errorCode,
        email,
      };
    }
  },

  // Get Google redirect result (for redirect flow)
  getGoogleRedirectResult: async () => {
    try {
      const result = await getRedirectResult(auth);

      if (result) {
        // User successfully signed in via redirect
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;

        return { success: true, user, token };
      }

      // No redirect result (user didn't come from redirect)
      return { success: true, user: null };
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData?.email || "";

      console.error("Google redirect result error:", {
        errorCode,
        errorMessage,
        email,
      });

      return {
        success: false,
        error: errorMessage,
        errorCode,
        email,
      };
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        callback(authUser);
      } else {
        callback(null);
      }
    });
  },
};

export default authService;
