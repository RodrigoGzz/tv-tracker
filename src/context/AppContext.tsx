import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrackedShow } from '../types';
import { getTrackedShows, addTrackedShow, removeTrackedShow, updateTrackedShow } from '../services/localStorage';
import { getShowEpisodes } from '../services/tvmaze';

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
  const fetchingTotalsRef = React.useRef<Set<number>>(new Set());
  const RUNNING_TTL_HOURS = 12;

  const needsRefresh = (s: TrackedShow) => {
    if (s.totalEpisodes == null) return true;
    const status = s.show.status?.toLowerCase() || '';
    if (status === 'ended') return false; // no caduca si terminó
    if (!s.totalEpisodesUpdatedAt) return true;
    const ageH = (Date.now() - new Date(s.totalEpisodesUpdatedAt).getTime()) / 36e5;
    return ageH > RUNNING_TTL_HOURS;
  };

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

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    const run = async () => {
      const promises: Promise<void>[] = [];
      trackedShows.forEach(ts => {
        if (!needsRefresh(ts)) return;
        if (fetchingTotalsRef.current.has(ts.id)) return;
        fetchingTotalsRef.current.add(ts.id);
        promises.push((async () => {
          try {
            const episodes = await getShowEpisodes(ts.show.id);
            if (cancelled) return;
            updateShowPartial(ts.id, {
              totalEpisodes: episodes.length,
              totalEpisodesUpdatedAt: new Date().toISOString()
            });
          } catch (e) {
            if (!cancelled) console.error('Error fetching totalEpisodes for show', ts.show.id, e);
          } finally {
            fetchingTotalsRef.current.delete(ts.id);
          }
        })());
      });
      if (promises.length) await Promise.all(promises);
    };
    run();
    return () => { cancelled = true; };
  }, [trackedShows, loading]);

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

  const updateShowPartial = (showId: number, patch: Partial<TrackedShow>) => {
    setTrackedShows(prev => {
      const next = prev.map(s => s.id === showId ? { ...s, ...patch } : s);
      // Persist change
      const target = next.find(s => s.id === showId);
      if (target) {
        try { updateTrackedShow(target); } catch (e) { console.error(e); }
      }
      return next;
    });
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
