import { TrackedShow, LocalStorageData } from '../types';

const STORAGE_KEY = 'tv-tracker-data';

// Obtener datos del localStorage
export const getStorageData = (): LocalStorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  
  return {
    trackedShows: [],
    lastUpdated: new Date().toISOString()
  };
};

// Guardar datos en localStorage
export const saveStorageData = (data: LocalStorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Agregar serie a seguimiento
export const addTrackedShow = (show: TrackedShow): void => {
  const data = getStorageData();
  
  // Verificar si ya está siendo seguida
  const existingIndex = data.trackedShows.findIndex(tracked => tracked.id === show.id);
  
  if (existingIndex === -1) {
    data.trackedShows.push(show);
    saveStorageData(data);
  }
};

// Remover serie del seguimiento
export const removeTrackedShow = (showId: number): void => {
  const data = getStorageData();
  data.trackedShows = data.trackedShows.filter(show => show.id !== showId);
  saveStorageData(data);
};

// Actualizar serie seguida
export const updateTrackedShow = (updatedShow: TrackedShow): void => {
  const data = getStorageData();
  const index = data.trackedShows.findIndex(show => show.id === updatedShow.id);
  
  if (index !== -1) {
    data.trackedShows[index] = updatedShow;
    saveStorageData(data);
  }
};

// Marcar episodio como visto
export const markEpisodeWatched = (showId: number, episodeId: number): void => {
  const data = getStorageData();
  const showIndex = data.trackedShows.findIndex(show => show.id === showId);
  
  if (showIndex !== -1) {
    const show = data.trackedShows[showIndex];
    if (!show.watchedEpisodes.includes(episodeId)) {
      show.watchedEpisodes.push(episodeId);
      show.lastWatched = new Date().toISOString();
      saveStorageData(data);
    }
  }
};

// Desmarcar episodio como visto
export const markEpisodeUnwatched = (showId: number, episodeId: number): void => {
  const data = getStorageData();
  const showIndex = data.trackedShows.findIndex(show => show.id === showId);
  
  if (showIndex !== -1) {
    const show = data.trackedShows[showIndex];
    show.watchedEpisodes = show.watchedEpisodes.filter(id => id !== episodeId);
    saveStorageData(data);
  }
};

// Verificar si un episodio está marcado como visto
export const isEpisodeWatched = (showId: number, episodeId: number): boolean => {
  const data = getStorageData();
  const show = data.trackedShows.find(show => show.id === showId);
  return show?.watchedEpisodes.includes(episodeId) || false;
};

// Obtener todas las series seguidas
export const getTrackedShows = (): TrackedShow[] => {
  const data = getStorageData();
  return data.trackedShows;
};

// Verificar si una serie está siendo seguida
export const isShowTracked = (showId: number): boolean => {
  const data = getStorageData();
  return data.trackedShows.some(show => show.id === showId);
};
