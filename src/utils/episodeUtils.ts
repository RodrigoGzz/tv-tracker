import { Episode } from '../types';

// Obtener episodios anteriores no vistos
export const getPreviousUnwatchedEpisodes = (
  episodes: Episode[],
  targetEpisode: Episode,
  watchedEpisodeIds: number[]
): Episode[] => {
  // Ordenar episodios por temporada y número
  const sortedEpisodes = [...episodes].sort((a, b) => {
    if (a.season !== b.season) {
      return a.season - b.season;
    }
    return a.number - b.number;
  });

  const targetIndex = sortedEpisodes.findIndex((ep) => ep.id === targetEpisode.id);
  if (targetIndex === -1) return [];

  const previousEpisodes = sortedEpisodes.slice(0, targetIndex);
  return previousEpisodes.filter((ep) => !watchedEpisodeIds.includes(ep.id));
};

// Verificar si un episodio puede ser marcado como visto sin saltarse otros
export const canWatchEpisodeNext = (
  episodes: Episode[],
  targetEpisode: Episode,
  watchedEpisodeIds: number[]
): boolean => {
  const previousUnwatched = getPreviousUnwatchedEpisodes(
    episodes,
    targetEpisode,
    watchedEpisodeIds
  );
  return previousUnwatched.length === 0;
};

// Obtener el próximo episodio que debería verse
export const getNextEpisodeToWatch = (
  episodes: Episode[],
  watchedEpisodeIds: number[]
): Episode | null => {
  const sortedEpisodes = [...episodes].sort((a, b) => {
    if (a.season !== b.season) {
      return a.season - b.season;
    }
    return a.number - b.number;
  });

  return sortedEpisodes.find((ep) => !watchedEpisodeIds.includes(ep.id)) || null;
};
