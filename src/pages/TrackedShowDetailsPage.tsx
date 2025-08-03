import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TrackedShow, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { getShowEpisodes } from '../services/tvmaze';
import { markEpisodeWatched, markEpisodeUnwatched, markMultipleEpisodesWatched, isEpisodeWatched } from '../services/localStorage';
import { getPreviousUnwatchedEpisodes, canWatchEpisodeNext } from '../utils/episodeUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import SkipEpisodesModal from '../components/SkipEpisodesModal';

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

  const showId = parseInt(id || '0');
  const trackedShow = trackedShows.find(ts => ts.id === showId);

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
    try {
      const episodeList = await getShowEpisodes(trackedShow.show.id);
      setEpisodes(episodeList);
      if (episodeList.length > 0) {
        setSelectedSeason(episodeList[0].season);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getSeasonEpisodes = (season: number) => {
    return episodes.filter(ep => ep.season === season);
  };

  const getWatchedCount = () => {
    return trackedShow?.watchedEpisodes.length || 0;
  };

  const getTotalEpisodes = () => {
    return episodes.length;
  };

  const getProgress = () => {
    if (episodes.length === 0) return 0;
    return Math.round((getWatchedCount() / getTotalEpisodes()) * 100);
  };

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
          <div className="tracked-show-poster">
            <img
              src={getImageUrl()}
              alt={trackedShow.show.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-show.jpg';
              }}
            />
          </div>

          <div className="tracked-show-info-detailed">
            <h1>{trackedShow.show.name}</h1>
            
            <div className="progress-info-detailed">
              <div className="progress-bar-detailed">
                <div 
                  className="progress-fill-detailed" 
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <span className="progress-text-detailed">
                {getWatchedCount()}/{getTotalEpisodes()} episodios ({getProgress()}%)
              </span>
            </div>

            {trackedShow.lastWatched && (
              <p className="last-watched-detailed">
                Último visto: {new Date(trackedShow.lastWatched).toLocaleDateString()}
              </p>
            )}

            <div className="tracked-show-actions-detailed">
              <button
                onClick={handleRemoveShow}
                className="remove-button-detailed"
              >
                ✕ Dejar de seguir
              </button>
            </div>
          </div>
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
                
                <div className="episodes-list">
                  {getSeasonEpisodes(selectedSeason).map(episode => (
                    <div 
                      key={episode.id} 
                      className={`episode-item ${isEpisodeWatched(trackedShow.show.id, episode.id) ? 'watched' : ''}`}
                      onClick={() => handleEpisodeToggle(episode)}
                    >
                      <label className="episode-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isEpisodeWatched(trackedShow.show.id, episode.id)}
                          onChange={() => handleEpisodeToggle(episode)}
                        />
                      </label>
                      
                      <div className="episode-info">
                        <div className="episode-name">
                          <span style={{ color: '#00d4ff', fontWeight: 'bold', marginRight: '0.5rem' }}>
                            S{episode.season}E{episode.number}
                          </span>
                          {episode.name}
                        </div>
                        {episode.airdate && (
                          <div className="episode-date">
                            📅 {new Date(episode.airdate).toLocaleDateString()}
                          </div>
                        )}
                        {episode.rating.average && (
                          <div style={{ color: '#ffc107', fontSize: '0.9rem' }}>
                            ⭐ {episode.rating.average}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: isEpisodeWatched(trackedShow.show.id, episode.id) ? '#28a745' : '#a0a0c4'
                      }}>
                        {isEpisodeWatched(trackedShow.show.id, episode.id) ? '✅' : '⏸️'}
                        <span style={{ fontSize: '0.9rem' }}>
                          {isEpisodeWatched(trackedShow.show.id, episode.id) ? 'Visto' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
