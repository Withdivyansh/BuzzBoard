import React, { createContext, useState, useContext } from 'react';
import { getUser as getStoredUser, setAuth as setStoredAuth, clearAuth as clearStoredAuth } from '../auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  const login = (token, userData) => {
    setStoredAuth(token, userData);
    setUser(userData);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };
  
  const updateUser = (userData) => {
    const token = localStorage.getItem('token');
    setStoredAuth(token, userData);
    setUser(userData);
  };

  const value = { user, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
