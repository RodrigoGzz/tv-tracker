import { Show, Episode, SearchResult } from '../types';

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

// Obtener series populares con paginación y exclusiones
export const getPopularShows = async (
  page: number = 0,
  excludeIds: number[] = [],
  minShows: number = 9
): Promise<{ shows: Show[]; hasMore: boolean }> => {
  try {
    let allShows: Show[] = [];
    let currentApiPage = 0;
    const maxApiPagesToLoad = 20; // Cargar más páginas para tener mejor selección

    // Cargar múltiples páginas de la API para tener un pool más grande
    while (currentApiPage < maxApiPagesToLoad) {
      const response = await fetch(`${BASE_URL}/shows?page=${currentApiPage}`);
      if (!response.ok) {
        break;
      }

      const shows: Show[] = await response.json();

      if (shows.length === 0) {
        break;
      }

      // Filtrar shows que tengan rating y no estén excluidos
      const validShows = shows.filter(
        (show) => show.rating.average !== null && !excludeIds.includes(show.id)
      );

      allShows = [...allShows, ...validShows];
      currentApiPage++;
    }

    // Ordenar TODOS los shows por rating descendente
    allShows.sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0));

    // Calcular el índice de inicio para esta página
    const startIndex = page * minShows;
    const endIndex = startIndex + minShows;

    // Obtener los shows para esta página específica
    const pageShows = allShows.slice(startIndex, endIndex);

    // Verificar si hay más páginas disponibles
    const hasMore = endIndex < allShows.length;

    return {
      shows: pageShows,
      hasMore,
    };
  } catch (error) {
    console.error('Error getting popular shows:', error);
    return {
      shows: [],
      hasMore: false,
    };
  }
};
