import React, { createContext, useCallback, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister, refreshToken as apiRefresh, forgotPassword as apiForgot, resetPassword as apiReset, verifyAccount as apiVerify } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
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
    const data = await apiLogin(username, password);
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setCurrentUser({ username: data.username, role: data.role });
    return data;
  }, []);

  const register = useCallback(async (form) => {
    const data = await apiRegister(form);
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setCurrentUser({ username: data.username, role: data.role });
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setRefreshToken(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!refreshToken) throw new Error('No refresh token');
    const data = await apiRefresh(refreshToken);
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setCurrentUser({ username: data.username, role: data.role });
    return data;
  }, [refreshToken]);

  const forgot = useCallback(async (username) => {
    return apiForgot(username);
  }, []);

  const reset = useCallback(async (token, newPassword) => {
    return apiReset(token, newPassword);
  }, []);

  const verify = useCallback(async (token) => {
    return apiVerify(token);
  }, []);

  const value = {
    token,
    currentUser,
    isAdmin: currentUser?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshAuth,
    refreshToken,
    forgot,
    reset,
    verify,
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