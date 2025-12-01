import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { authService } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Google redirect result on page load
    const checkRedirectResult = async () => {
      try {
        const result = await authService.getGoogleRedirectResult();
        if (result.success && result.user) {
          console.log("Google sign-in successful via redirect");
        }
      } catch (error) {
        console.error("Error checking redirect result:", error);
      }
    };

    checkRedirectResult();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Register function
  const register = async (email, password, name) => {
    return await authService.register(email, password, name);
  };

  // Login function
  const login = async (email, password) => {
    return await authService.login(email, password);
  };

  // Login with Google function
  const loginWithGoogle = async () => {
    return await authService.loginWithGoogle();
  };

  // Logout function
  const logout = async () => {
    return await authService.logout();
  };

  // Reset password function
  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
