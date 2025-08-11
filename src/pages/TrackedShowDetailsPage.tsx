import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrackedShow, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { getShowEpisodes } from '../services/tvmaze';
import { markEpisodeWatched, markEpisodeUnwatched, markMultipleEpisodesWatched, isEpisodeWatched } from '../services/localStorage';
import { getPreviousUnwatchedEpisodes, canWatchEpisodeNext } from '../utils/episodeUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SkipEpisodesModal from '../components/SkipEpisodesModal';
import { useShowProgress } from '../hooks/useShowProgress';
import ShowHeader from '../components/ShowHeader';
import EpisodeList from '../components/EpisodeList';

const TrackedShowDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trackedShows, updateShow, removeShow } = useApp();
  
  const [activeTab, setActiveTab] = useState<'episodes' | 'info'>('episodes');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [pendingEpisode, setPendingEpisode] = useState<Episode | null>(null);
  const [skippedEpisodes, setSkippedEpisodes] = useState<Episode[]>([]);
  const firstPendingIdRef = useRef<number | null>(null);
  const hasScrolledRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const showId = parseInt(id || '0');
  const trackedShow = trackedShows.find(ts => ts.id === showId);
  const progressData = useShowProgress(showId, episodes);

  useEffect(() => {
    if (!trackedShow) {
      navigate('/my-shows');
      return;
    }
    loadEpisodes();
  }, [trackedShow]);

  const loadEpisodes = async () => {
    if (!trackedShow) return;
    setLoading(true);
    setLoadError(null);
    try {
      const episodeList = await getShowEpisodes(trackedShow.show.id);
      setEpisodes(episodeList);
      if (episodeList.length > 0) {
        const watchedSet = new Set(trackedShow.watchedEpisodes);
        const firstUnwatched = episodeList.find(ep => !watchedSet.has(ep.id));
        if (firstUnwatched) {
          setSelectedSeason(firstUnwatched.season);
          firstPendingIdRef.current = firstUnwatched.id;
          hasScrolledRef.current = false;
        } else {
          setSelectedSeason(episodeList[episodeList.length - 1].season);
          firstPendingIdRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
      setLoadError('No se pudieron cargar los episodios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (activeTab !== 'episodes') return;
    if (hasScrolledRef.current) return;
    if (!firstPendingIdRef.current) return;
    // pequeño delay para asegurar render
    const t = setTimeout(() => {
      const el = document.getElementById(`episode-${firstPendingIdRef.current}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('auto-scroll-highlight');
        setTimeout(() => el.classList.remove('auto-scroll-highlight'), 2000);
        hasScrolledRef.current = true;
      }
    }, 150);
    return () => clearTimeout(t);
  }, [loading, activeTab, selectedSeason, episodes]);

  const handleEpisodeToggle = (episode: Episode) => {
    if (!trackedShow) return;
    
    const isWatched = isEpisodeWatched(trackedShow.show.id, episode.id);
    
    if (isWatched) {
      // Si está marcado como visto, simplemente desmarcarlo
      markEpisodeUnwatched(trackedShow.show.id, episode.id);
      const updatedShow: TrackedShow = {
        ...trackedShow,
        watchedEpisodes: trackedShow.watchedEpisodes.filter(id => id !== episode.id)
      };
      updateShow(updatedShow);
    } else {
      // Si no está marcado como visto, verificar si se puede marcar sin saltarse episodios
      const canWatch = canWatchEpisodeNext(episodes, episode, trackedShow.watchedEpisodes);
      
      if (canWatch) {
        // Se puede marcar directamente
        markEpisodeWatched(trackedShow.show.id, episode.id);
        const updatedShow: TrackedShow = {
          ...trackedShow,
          watchedEpisodes: [...trackedShow.watchedEpisodes, episode.id],
          lastWatched: new Date().toISOString()
        };
        updateShow(updatedShow);
      } else {
        // Hay episodios anteriores sin ver, mostrar modal
        const previousUnwatched = getPreviousUnwatchedEpisodes(episodes, episode, trackedShow.watchedEpisodes);
        setSkippedEpisodes(previousUnwatched);
        setPendingEpisode(episode);
        setShowSkipModal(true);
      }
    }
  };

  const handleSkipModalConfirm = () => {
    if (!trackedShow || !pendingEpisode) return;
    
    // Marcar todos los episodios anteriores y el actual como vistos
    const episodeIdsToMark = [...skippedEpisodes.map(ep => ep.id), pendingEpisode.id];
    markMultipleEpisodesWatched(trackedShow.show.id, episodeIdsToMark);
    
    const updatedShow: TrackedShow = {
      ...trackedShow,
      watchedEpisodes: Array.from(new Set([...trackedShow.watchedEpisodes, ...episodeIdsToMark])),
      lastWatched: new Date().toISOString()
    };
    updateShow(updatedShow);
    
    setShowSkipModal(false);
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  const handleSkipModalCancel = () => {
    if (!trackedShow || !pendingEpisode) return;
    
    // Marcar solo el episodio seleccionado como visto
    markEpisodeWatched(trackedShow.show.id, pendingEpisode.id);
    const updatedShow: TrackedShow = {
      ...trackedShow,
      watchedEpisodes: [...trackedShow.watchedEpisodes, pendingEpisode.id],
      lastWatched: new Date().toISOString()
    };
    updateShow(updatedShow);
    
    setShowSkipModal(false);
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  const handleSkipModalClose = () => {
    setShowSkipModal(false);
    setPendingEpisode(null);
    setSkippedEpisodes([]);
  };

  const handleRemoveShow = () => {
    if (!trackedShow) return;
    
    if (window.confirm(`¿Estás seguro de que quieres dejar de seguir "${trackedShow.show.name}"?`)) {
      removeShow(trackedShow.show.id);
      navigate('/my-shows');
    }
  };

  const getSeasons = () => {
    if (episodes.length === 0) return [];
    const seasonNumbers = episodes.map(ep => ep.season);
    const uniqueSeasons = Array.from(new Set(seasonNumbers));
    return uniqueSeasons.sort((a, b) => a - b);
  };

  const getWatchedCount = () => progressData.watchedCount;
  const getTotalEpisodes = () => progressData.totalEpisodes;
  const getProgress = () => progressData.progress;

  const stripHtml = (html: string | null) => {
    if (!html) return 'Sin descripción disponible';
    return html.replace(/<[^>]*>/g, '');
  };

  const formatGenres = (genres: string[]) => {
    return genres.join(', ') || 'Sin géneros especificados';
  };

  const getImageUrl = () => {
    return trackedShow?.show.image?.original || trackedShow?.show.image?.medium || '/placeholder-show.jpg';
  };

  const getOrderedEpisodes = () => {
    return [...episodes].sort((a,b)=>{
      if (a.season === b.season) return a.number - b.number;
      return a.season - b.season;
    });
  };

  const getNextEpisodeToWatch = (): Episode | null => {
    if (!trackedShow) return null;
    const watchedSet = new Set(trackedShow.watchedEpisodes);
    const ordered = getOrderedEpisodes();
    return ordered.find(ep => !watchedSet.has(ep.id)) || null;
  };

  const handleMarkNextEpisode = () => {
    if (!trackedShow) return;
    const nextEp = getNextEpisodeToWatch();
    if (!nextEp) return;
    // marcar directamente (no hay posibilidad de saltarse anteriores porque tomamos el primero no visto)
    markEpisodeWatched(trackedShow.show.id, nextEp.id);
    const updatedShow: TrackedShow = {
      ...trackedShow,
      watchedEpisodes: [...trackedShow.watchedEpisodes, nextEp.id],
      lastWatched: new Date().toISOString()
    };
    updateShow(updatedShow);
    // si el episodio está en otra temporada, cambiar selector
    if (selectedSeason !== nextEp.season) {
      setSelectedSeason(nextEp.season);
    }
    // preparar scroll/higlight a siguiente episodios
    firstPendingIdRef.current = getNextEpisodeToWatch()?.id || null;
    hasScrolledRef.current = false;
  };

  if (!trackedShow) {
    return (
      <div className="tracked-show-details-error">
        <h2>Serie no encontrada</h2>
        <p>No se pudo encontrar la serie en tu lista de seguimiento.</p>
        <button onClick={() => navigate('/my-shows')} className="back-button">
          ← Volver a Mis Series
        </button>
      </div>
    );
  }

  const seasons = getSeasons();

  return (
    <div className="tracked-show-details-page">
      <div className="tracked-show-details-header">
        <button onClick={() => navigate('/my-shows')} className="back-button">
          ← Volver a Mis Series
        </button>
      </div>

      <div className="tracked-show-details-content">
        <div className="tracked-show-details-main">
          <ShowHeader
            trackedShow={trackedShow}
            progress={getProgress()}
            watched={getWatchedCount()}
            total={getTotalEpisodes()}
            lastWatched={trackedShow.lastWatched}
            onMarkNext={handleMarkNextEpisode}
            onRemove={handleRemoveShow}
            disableMarkNext={loading}
            getImageUrl={getImageUrl}
            getNextEpisodeToWatch={getNextEpisodeToWatch}
          />
        </div>

        <div className="tracked-show-tabs">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`tab-button ${activeTab === 'episodes' ? 'active' : ''}`}
          >
            📺 Episodios
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          >
            ℹ️ Información
          </button>
        </div>

        {activeTab === 'episodes' && (
          <div className="episodes-tab">
            {loading ? (
              <LoadingSpinner />
            ) : loadError ? (
              <div className="episodes-error-box">
                <div className="episodes-error-text">⚠️ {loadError}</div>
                <button
                  onClick={loadEpisodes}
                  className="retry-load-button"
                >Reintentar</button>
              </div>
            ) : (
              <>
                {seasons.length > 1 && (
                  <div className="season-selector">
                    <label>Temporada: </label>
                    <select 
                      value={selectedSeason} 
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    >
                      {seasons.map(season => (
                        <option key={season} value={season}>
                          Temporada {season}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <EpisodeList
                  trackedShow={trackedShow}
                  episodes={episodes}
                  season={selectedSeason}
                  onToggle={handleEpisodeToggle}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="show-meta">
              <div className="meta-item">
                <span className="meta-label">Estado:</span>
                <span className={`meta-value status-${trackedShow.show.status.toLowerCase()}`}>
                  {trackedShow.show.status}
                </span>
              </div>
              
              {trackedShow.show.rating.average && (
                <div className="meta-item">
                  <span className="meta-label">Rating:</span>
                  <span className="meta-value rating">⭐ {trackedShow.show.rating.average}</span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Géneros:</span>
                <span className="meta-value">{formatGenres(trackedShow.show.genres)}</span>
              </div>
              
              {trackedShow.show.premiered && (
                <div className="meta-item">
                  <span className="meta-label">Estreno:</span>
                  <span className="meta-value">
                    {new Date(trackedShow.show.premiered).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {trackedShow.show.ended && (
                <div className="meta-item">
                  <span className="meta-label">Finalizada:</span>
                  <span className="meta-value">
                    {new Date(trackedShow.show.ended).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {trackedShow.show.network && (
                <div className="meta-item">
                  <span className="meta-label">Cadena:</span>
                  <span className="meta-value">
                    {trackedShow.show.network.name} ({trackedShow.show.network.country.name})
                  </span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Idioma:</span>
                <span className="meta-value">{trackedShow.show.language}</span>
              </div>

              <div className="meta-item">
                <span className="meta-label">Añadida el:</span>
                <span className="meta-value">
                  {new Date(trackedShow.addedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="show-description">
              <h3>Sinopsis</h3>
              <p>{stripHtml(trackedShow.show.summary)}</p>
            </div>
          </div>
        )}
      </div>

      <SkipEpisodesModal
        isOpen={showSkipModal}
        onClose={handleSkipModalClose}
        onConfirm={handleSkipModalConfirm}
        onCancel={handleSkipModalCancel}
        skippedEpisodes={skippedEpisodes}
        targetEpisode={pendingEpisode!}
      />
    </div>
  );
};

export default TrackedShowDetailsPage;
