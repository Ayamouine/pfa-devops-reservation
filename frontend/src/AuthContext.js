import React, { createContext, useCallback, useContext, useState } from 'react';
import { AUTH_URL } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = useCallback((text, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const askConfirm = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Erreur ${res.status}`);
    }
    const data = await res.json();
    setToken(data.token);
    setCurrentUser({ username: data.username, role: data.role });
    return data;
  }, []);

  const register = useCallback(async (form) => {
    const res = await fetch(`${AUTH_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Erreur ${res.status}`);
    }
    const data = await res.json();
    setToken(data.token);
    setCurrentUser({ username: data.username, role: data.role });
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  const value = {
    token,
    currentUser,
    isAdmin: currentUser?.role === 'ADMIN',
    login,
    register,
    logout,
    showToast,
    toasts,
    askConfirm,
    confirmDialog,
    setConfirmDialog,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}