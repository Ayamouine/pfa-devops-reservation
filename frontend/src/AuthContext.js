import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  refreshToken as apiRefresh,
  forgotPassword as apiForgot,
  resetPassword as apiReset,
  verifyAccount as apiVerify,
  updateProfile as apiUpdateProfile,
} from './api';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'pfa_auth';

function sanitizeUser(data) {
  if (!data) return null;
  return {
    id: data.id,
    username: data.username,
    role: data.role,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    filiere: data.filiere || '',
    avatarColor: data.avatarColor || '',
  };
}

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, refreshToken: null, currentUser: null };
    const data = JSON.parse(raw);
    return {
      token: data.token || null,
      refreshToken: data.refreshToken || null,
      currentUser: data.currentUser ? sanitizeUser(data.currentUser) : null,
    };
  } catch {
    return { token: null, refreshToken: null, currentUser: null };
  }
}

function saveStoredAuth(token, refreshToken, currentUser) {
  try {
    if (!token || !currentUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, refreshToken, currentUser }));
  } catch {}
}

export function AuthProvider({ children }) {
  const initial = loadStoredAuth();
  const [token, setToken] = useState(initial.token);
  const [refreshToken, setRefreshToken] = useState(initial.refreshToken);
  const [currentUser, setCurrentUser] = useState(initial.currentUser);

  useEffect(() => {
    saveStoredAuth(token, refreshToken, currentUser);
  }, [token, refreshToken, currentUser]);
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
    setCurrentUser(sanitizeUser(data));
    return data;
  }, []);

  const register = useCallback(async (form) => {
    const data = await apiRegister(form);
    setToken(data.token);
    setRefreshToken(data.refreshToken);
    setCurrentUser(sanitizeUser(data));
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
    setCurrentUser(sanitizeUser(data));
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

  const saveProfile = useCallback(async (username, payload) => {
    const data = await apiUpdateProfile(token, username, payload);
    setCurrentUser(sanitizeUser(data));
    return data;
  }, [token]);

  const role = currentUser?.role || '';
  const value = {
    token,
    currentUser,
    setCurrentUser,
    role,
    isAdmin: role === 'ADMIN',
    isEtudiant: role === 'ETUDIANT',
    isProf: role === 'PROF',
    isChef: role === 'CHEF_FILIERE',
    isDoyen: role === 'DOYEN',
    canBook: role === 'PROF' || role === 'CHEF_FILIERE' || role === 'DOYEN' || role === 'ADMIN',
    fullName: currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username
      : '',
    login,
    register,
    logout,
    refreshAuth,
    refreshToken,
    forgot,
    reset,
    verify,
    saveProfile,
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