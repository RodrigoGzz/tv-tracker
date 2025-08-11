import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TrackedShow, Episode } from '../types';

export interface UseShowProgressResult {
  trackedShow?: TrackedShow;
  totalEpisodes: number;
  watchedCount: number;
  progress: number; // 0-100
  isCompleted: boolean;
}

export function useShowProgress(showId: number, episodes?: Episode[]): UseShowProgressResult {
  const { trackedShows } = useApp();
  const trackedShow = trackedShows.find((s) => s.id === showId);

  return useMemo(() => {
    if (!trackedShow) {
      return {
        trackedShow: undefined,
        totalEpisodes: 0,
        watchedCount: 0,
        progress: 0,
        isCompleted: false,
      };
    }
    const watchedCount = trackedShow.watchedEpisodes.length;
    // Preferimos episodes param si se pasa (detalle ya tiene la lista completa), si no usamos totalEpisodes cacheado.
    const totalEpisodes = episodes?.length ?? trackedShow.totalEpisodes ?? 0;
    const progress = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;
    const isCompleted = totalEpisodes > 0 && watchedCount >= totalEpisodes;
    return { trackedShow, totalEpisodes, watchedCount, progress, isCompleted };
  }, [trackedShow, episodes]);
}
