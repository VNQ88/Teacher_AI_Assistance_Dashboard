'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { tokenManager } from '@/lib/api/client';
import { authApi } from '@/lib/api/auth';
import { userApi } from '@/lib/api/questions';
import type { UserResponse } from '@/lib/types';

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserResponse | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const currentUser = await userApi.getCurrentUser();
          setUser(currentUser);
        } catch {
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const logout = () => {
    setUser(null);
    authApi.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
