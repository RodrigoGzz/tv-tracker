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

// Obtener series populares (usando una búsqueda genérica como alternativa)
export const getPopularShows = async (): Promise<Show[]> => {
  try {
    // TVMaze no tiene endpoint de series populares, así que usaremos algunas búsquedas predefinidas
    const popularQueries = ['Game of Thrones', 'Breaking Bad', 'The Office', 'Friends', 'Stranger Things'];
    const promises = popularQueries.map(query => searchShows(query));
    const results = await Promise.all(promises);
    
    return results
      .filter(result => result.length > 0)
      .map(result => result[0].show)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting popular shows:', error);
    return [];
  }
};

// Obtener programación de hoy
export const getTodaySchedule = async (): Promise<ScheduleItem[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${BASE_URL}/schedule?date=${today}`);
    if (!response.ok) {
      throw new Error('Error al obtener la programación');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting today schedule:', error);
    return [];
  }
};
