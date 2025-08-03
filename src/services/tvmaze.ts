import { Show, Episode, SearchResult, ScheduleItem } from '../types';

const BASE_URL = 'https://api.tvmaze.com';

// Buscar series
export const searchShows = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/shows?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Error al buscar series');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching shows:', error);
    throw error;
  }
};

// Obtener detalles de una serie
export const getShowDetails = async (showId: number): Promise<Show> => {
  try {
    const response = await fetch(`${BASE_URL}/shows/${showId}`);
    if (!response.ok) {
      throw new Error('Error al obtener detalles de la serie');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting show details:', error);
    throw error;
  }
};

// Obtener episodios de una serie
export const getShowEpisodes = async (showId: number): Promise<Episode[]> => {
  try {
    const response = await fetch(`${BASE_URL}/shows/${showId}/episodes`);
    if (!response.ok) {
      throw new Error('Error al obtener episodios');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting episodes:', error);
    throw error;
  }
};

// Obtener series populares con paginación
export const getPopularShows = async (page: number = 0): Promise<{ shows: Show[], hasMore: boolean }> => {
  try {
    // TVMaze API permite obtener shows con paginación
    const response = await fetch(`${BASE_URL}/shows?page=${page}`);
    if (!response.ok) {
      throw new Error('Error al obtener series populares');
    }
    
    const shows: Show[] = await response.json();
    
    // Filtrar shows que tengan rating y ordenar por rating descendente
    const showsWithRating = shows
      .filter(show => show.rating.average !== null)
      .sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0));
    
    // Tomar las primeras 10 series más populares de esta página
    const popularShows = showsWithRating.slice(0, 9);
    
    // Verificar si hay más páginas disponibles
    const hasMore = shows.length > 0;
    
    return {
      shows: popularShows,
      hasMore
    };
  } catch (error) {
    console.error('Error getting popular shows:', error);
    return {
      shows: [],
      hasMore: false
    };
  }
};
