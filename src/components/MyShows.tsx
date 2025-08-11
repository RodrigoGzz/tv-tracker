import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';
import { getShowEpisodes } from '../services/tvmaze';

// Caché local de conteo de episodios
interface EpisodesCacheEntry { total: number; updatedAt: string; status: string; }
const EPISODES_CACHE_KEY = 'episodesCountCache:v1';
const RUNNING_TTL_HOURS = 12; // refrescar cada 12h para series en emisión

function loadEpisodesCache(): Record<number, EpisodesCacheEntry> {
  try {
    const raw = localStorage.getItem(EPISODES_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function saveEpisodesCache(cache: Record<number, EpisodesCacheEntry>) {
  try { localStorage.setItem(EPISODES_CACHE_KEY, JSON.stringify(cache)); } catch {}
}
function isStale(entry: EpisodesCacheEntry): boolean {
  if (!entry) return true;
  // Si la serie está terminada, no caduca
  if (entry.status && entry.status.toLowerCase() === 'ended') return false;
  const updated = new Date(entry.updatedAt).getTime();
  const ageHours = (Date.now() - updated) / 36e5;
  return ageHours > RUNNING_TTL_HOURS;
}

const MyShows: React.FC = () => {
  const { trackedShows, loading } = useApp();

  // Estado basado en caché inicial
  const [episodesCount, setEpisodesCount] = React.useState<Record<number, number>>(() => {
    const cache = loadEpisodesCache();
    const initial: Record<number, number> = {};
    Object.entries(cache).forEach(([id, entry]) => { initial[Number(id)] = entry.total; });
    return initial;
  });
  const cacheRef = React.useRef<Record<number, EpisodesCacheEntry>>(loadEpisodesCache());
  const fetchingRef = React.useRef<Set<number>>(new Set());

  // Efecto para actualizar/obtener totales sólo cuando sea necesario
  React.useEffect(() => {
    let cancelled = false;
    const updateCounts = async () => {
      const promises: Promise<void>[] = [];
      for (const ts of trackedShows) {
        const showId = ts.show.id;
        const status = ts.show.status || '';
        const cacheEntry = cacheRef.current[showId];
        if (!cacheEntry || isStale(cacheEntry)) {
          if (fetchingRef.current.has(showId)) continue;
          fetchingRef.current.add(showId);
          promises.push((async () => {
            try {
              const episodes = await getShowEpisodes(showId);
              if (cancelled) return;
              cacheRef.current[showId] = { total: episodes.length, updatedAt: new Date().toISOString(), status };
              setEpisodesCount(prev => ({ ...prev, [showId]: episodes.length }));
              saveEpisodesCache(cacheRef.current);
            } catch (e) {
              console.error('Error obteniendo episodios para show', showId, e);
              if (!cancelled) {
                cacheRef.current[showId] = { total: 0, updatedAt: new Date().toISOString(), status };
                setEpisodesCount(prev => ({ ...prev, [showId]: 0 }));
                saveEpisodesCache(cacheRef.current);
              }
            } finally {
              fetchingRef.current.delete(showId);
            }
          })());
        } else {
          // Asegurar que el estado tenga el valor (por si entró un show nuevo ya cacheado)
          if (episodesCount[showId] == null) {
            setEpisodesCount(prev => ({ ...prev, [showId]: cacheEntry.total }));
          }
        }
      }
      await Promise.all(promises);
    };
    if (trackedShows.length > 0) updateCounts();
    return () => { cancelled = true; };
  }, [trackedShows]);

  if (loading) {
    return (
      <div className="my-shows-loading">
        <LoadingSpinner />
        <p>Cargando tus series...</p>
      </div>
    );
  }

  if (trackedShows.length === 0) {
    return (
      <div className="my-shows-empty">
        <div className="empty-state">
          <h2>No tienes series en seguimiento</h2>
          <p>Busca series y añádelas a tu lista para empezar a hacer seguimiento de tus episodios.</p>
          <div className="empty-tips">
            <h3>💡 Consejos:</h3>
            <ul>
              <li>Usa la búsqueda para encontrar tus series favoritas</li>
              <li>Haz clic en "Seguir" para añadir una serie a tu lista</li>
              <li>Marca episodios como vistos para llevar tu progreso</li>
              <li>Toda tu información se guarda localmente en tu dispositivo</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Estadísticas generales
  const totalShows = trackedShows.length;
  const totalWatchedEpisodes = trackedShows.reduce((sum, show) => sum + show.watchedEpisodes.length, 0);
  const completedShows = trackedShows.filter(show => show.isCompleted).length;

  const getImageUrl = (trackedShow: any) => {
    return trackedShow.show.image?.medium || trackedShow.show.image?.original || '/placeholder-show.jpg';
  };

  const getProgress = (trackedShow: any) => {
    const total = episodesCount[trackedShow.show.id];
    if (!total || total === 0) return 0;
    const watched = trackedShow.watchedEpisodes.length;
    return Math.round((watched / total) * 100);
  };

  return (
    <div className="my-shows">
      <div className="my-shows-header">
        <h1>Mis Series</h1>
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{totalShows}</span>
            <span className="stat-label">Series siguiendo</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{totalWatchedEpisodes}</span>
            <span className="stat-label">Episodios vistos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{completedShows}</span>
            <span className="stat-label">Series completadas</span>
          </div>
        </div>
      </div>

      <div className="my-shows-grid">
        {trackedShows
          .sort((a, b) => {
            // Ordenar por última vez visto (más reciente primero)
            if (a.lastWatched && b.lastWatched) {
              return new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime();
            }
            if (a.lastWatched && !b.lastWatched) return -1;
            if (!a.lastWatched && b.lastWatched) return 1;
            return a.show.name.localeCompare(b.show.name);
          })
          .map(trackedShow => (
            <Link
              key={trackedShow.id}
              to={`/my-shows/${trackedShow.id}`}
              className="my-show-card"
            >
              <div className="my-show-image">
                <img
                  src={getImageUrl(trackedShow)}
                  alt={trackedShow.show.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-show.jpg';
                  }}
                />
                <div className="progress-overlay">
                  <div
                    className="progress-circle"
                    style={{
                      background: `conic-gradient(#00d4ff ${getProgress(trackedShow)}%, #3a3a6b ${getProgress(trackedShow)}%)`
                    }}
                  >
                    <div className="progress-text">
                      {episodesCount[trackedShow.show.id] == null ? '...' : `${getProgress(trackedShow)}%`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-show-info">
                <h3 className="my-show-title">{trackedShow.show.name}</h3>
                <p className="my-show-status">{trackedShow.show.status}</p>
                {trackedShow.lastWatched && (
                  <p className="my-show-last-watched">
                    Último visto: {new Date(trackedShow.lastWatched).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default MyShows;
