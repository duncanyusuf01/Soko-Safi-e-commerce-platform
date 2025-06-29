// client/src/context/UserProvider.js

import React, { createContext, useState, useEffect, useCallback } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Function to check session from backend
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/check_session', {
        credentials: 'include',
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Function to manually log in a user (e.g. after successful login form)
  const login = (userData) => {
    setUser(userData);
  };

  // ✅ Logout
  const logout = async () => {
    await fetch('/logout', { method: 'DELETE', credentials: 'include' });
    setUser(null);
  };

  // ✅ Check session on component mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ✅ Context value
  const value = { user, login, logout, loading, refetchUser: checkSession };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
