// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, AuthUser } from "../services/auth";

interface AuthContextType {
  currentUser: AuthUser | null;
  user: AuthUser | null; // Adding user property for backward compatibility
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{
    success: boolean;
    error?: string;
    user?: any;
    token?: string;
  }>;
  register: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    return result;
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await authService.register(email, password, name);
    return result;
  };

  const logout = async () => {
    const result = await authService.logout();
    return result;
  };

  const resetPassword = async (email: string) => {
    const result = await authService.resetPassword(email);
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await authService.loginWithGoogle();
    return result;
  };

  const value = {
    currentUser,
    user: currentUser, // Adding user property that references currentUser
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
