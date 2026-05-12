import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const loadAuthState = async () => {
    setIsLoadingPublicSettings(true);
    setAuthError(null);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(await authService.isAuthenticated());
      const settings = await settingsService.listSettings();
      setAppPublicSettings({ id: 'local', public_settings: settings });
    } catch (error) {
      console.warn('Fake auth fallback:', error);
      setUser({ id: 'guest', name: 'Guest' });
      setIsAuthenticated(false);
      setAppPublicSettings({ id: 'local', public_settings: [] });
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    // No-op in standalone mode
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkAppState: loadAuthState,
        checkUserAuth: loadAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
