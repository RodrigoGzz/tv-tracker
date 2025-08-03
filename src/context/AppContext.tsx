import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrackedShow } from '../types';
import { getTrackedShows, addTrackedShow, removeTrackedShow, updateTrackedShow } from '../services/localStorage';

interface AppContextType {
  trackedShows: TrackedShow[];
  addShow: (show: TrackedShow) => void;
  removeShow: (showId: number) => void;
  updateShow: (show: TrackedShow) => void;
  isShowTracked: (showId: number) => boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [trackedShows, setTrackedShows] = useState<TrackedShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del localStorage al inicializar
    const loadData = () => {
      try {
        const shows = getTrackedShows();
        setTrackedShows(shows);
      } catch (error) {
        console.error('Error loading tracked shows:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addShow = (show: TrackedShow) => {
    try {
      addTrackedShow(show);
      setTrackedShows(prev => [...prev, show]);
    } catch (error) {
      console.error('Error adding show:', error);
    }
  };

  const removeShow = (showId: number) => {
    try {
      removeTrackedShow(showId);
      setTrackedShows(prev => prev.filter(show => show.id !== showId));
    } catch (error) {
      console.error('Error removing show:', error);
    }
  };

  const updateShow = (updatedShow: TrackedShow) => {
    try {
      updateTrackedShow(updatedShow);
      setTrackedShows(prev => 
        prev.map(show => show.id === updatedShow.id ? updatedShow : show)
      );
    } catch (error) {
      console.error('Error updating show:', error);
    }
  };

  const isShowTracked = (showId: number): boolean => {
    return trackedShows.some(show => show.id === showId);
  };

  const value: AppContextType = {
    trackedShows,
    addShow,
    removeShow,
    updateShow,
    isShowTracked,
    loading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
