'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MockUser } from '../api/mockUsers';
import { useQueryClient } from '@tanstack/react-query';

interface SessionContextProps {
  currentUser: MockUser;
  setCurrentUser: (user: MockUser) => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<MockUser>(MOCK_USERS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Read cached profile from local storage on mount
    const savedUserId = localStorage.getItem('x-user-id');
    if (savedUserId) {
      const user = MOCK_USERS.find((u) => u.id === savedUserId);
      if (user) {
        setCurrentUserState(user);
      }
    } else {
      // Default to Alice if not set
      localStorage.setItem('x-user-id', MOCK_USERS[0].id);
      localStorage.setItem('x-user-role', MOCK_USERS[0].role);
    }
    setIsLoading(false);
  }, []);

  const setCurrentUser = (user: MockUser) => {
    setCurrentUserState(user);
    localStorage.setItem('x-user-id', user.id);
    localStorage.setItem('x-user-role', user.role);

    // Wipe and reload all queries to fetch fresh data for the newly selected user
    queryClient.resetQueries();
  };

  return (
    <SessionContext.Provider value={{ currentUser, setCurrentUser, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
