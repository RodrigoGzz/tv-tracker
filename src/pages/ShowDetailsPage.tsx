import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Show, Episode } from '../types';
import { getShowDetails, getShowEpisodes } from '../services/tvmaze';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ShowDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addShow, removeShow, isShowTracked } = useApp();
  
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  const showId = parseInt(id || '0');
  const isTracked = isShowTracked(showId);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    loadShowDetails();
  }, [id]);

  const loadShowDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const showData = await getShowDetails(showId);
      setShow(showData);
      await loadEpisodes(showId);
    } catch (error) {
      console.error('Error loading show details:', error);
      setError('Error al cargar los detalles de la serie');
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async (showId: number) => {
    setLoadingEpisodes(true);
    try {
      const episodeList = await getShowEpisodes(showId);
      setEpisodes(episodeList);
      if (episodeList.length > 0) {
        setSelectedSeason(episodeList[0].season);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const handleToggleTracking = () => {
    if (!show) return;
    
    if (isTracked) {
      removeShow(show.id);
    } else {
      const newTrackedShow = {
        id: show.id,
        show,
        addedAt: new Date().toISOString(),
        watchedEpisodes: [],
        currentSeason: 1,
        currentEpisode: 1,
        lastWatched: null,
        isCompleted: false
      };
      addShow(newTrackedShow);
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

  const stripHtml = (html: string | null) => {
    if (!html) return 'Sin descripción disponible';
    return html.replace(/<[^>]*>/g, '');
  };

  const formatGenres = (genres: string[]) => {
    return genres.join(', ') || 'Sin géneros especificados';
  };

  const getImageUrl = () => {
    return show?.image?.original || show?.image?.medium || '/placeholder-show.jpg';
  };

  if (loading) {
    return (
      <div className="show-details-loading">
        <LoadingSpinner />
        <p>Cargando detalles de la serie...</p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="show-details-error">
        <h2>Error</h2>
        <p>{error || 'No se pudo cargar la serie'}</p>
        <button onClick={() => navigate('/')} className="back-button">
          ← Volver al inicio
        </button>
      </div>
    );
  }

  const seasons = getSeasons();

  return (
    <div className="show-details-page">
      <div className="show-details-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Volver
        </button>
      </div>

      <div className="show-details-content">
        <div className="show-details-main">
          <div className="show-poster">
            <img
              src={getImageUrl()}
              alt={show.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-show.jpg';
              }}
            />
          </div>

          <div className="show-info-detailed">
            <h1>{show.name}</h1>
            
            <div className="show-meta">
              <div className="meta-item">
                <span className="meta-label">Estado:</span>
                <span className={`meta-value status-${show.status.toLowerCase()}`}>
                  {show.status}
                </span>
              </div>
              
              {show.rating.average && (
                <div className="meta-item">
                  <span className="meta-label">Rating:</span>
                  <span className="meta-value rating">⭐ {show.rating.average}</span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Géneros:</span>
                <span className="meta-value">{formatGenres(show.genres)}</span>
              </div>
              
              {show.premiered && (
                <div className="meta-item">
                  <span className="meta-label">Estreno:</span>
                  <span className="meta-value">
                    {new Date(show.premiered).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {show.ended && (
                <div className="meta-item">
                  <span className="meta-label">Finalizada:</span>
                  <span className="meta-value">
                    {new Date(show.ended).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {show.network && (
                <div className="meta-item">
                  <span className="meta-label">Cadena:</span>
                  <span className="meta-value">
                    {show.network.name} ({show.network.country.name})
                  </span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Idioma:</span>
                <span className="meta-value">{show.language}</span>
              </div>
            </div>

            <div className="show-actions-detailed">
              <button
                onClick={handleToggleTracking}
                className={`track-button-detailed ${isTracked ? 'tracked' : 'untracked'}`}
              >
                {isTracked ? '✓ Siguiendo' : '+ Seguir serie'}
              </button>
            </div>
          </div>
        </div>

        <div className="show-description">
          <h2>Sinopsis</h2>
          <p>{stripHtml(show.summary)}</p>
        </div>

        {episodes.length > 0 && (
          <div className="show-episodes">
            <div className="episodes-header">
              <h2>Episodios ({episodes.length} total)</h2>
              {loadingEpisodes && <LoadingSpinner />}
            </div>

            {seasons.length > 1 && (
              <div className="season-tabs">
                {seasons.map(season => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season)}
                    className={`season-tab ${selectedSeason === season ? 'active' : ''}`}
                  >
                    Temporada {season}
                  </button>
                ))}
              </div>
            )}

            <div className="episodes-grid">
              {getSeasonEpisodes(selectedSeason).map(episode => (
                <div key={episode.id} className="episode-card">
                  <div className="episode-thumbnail">
                    {episode.image ? (
                      <img 
                        src={episode.image.medium || episode.image.original} 
                        alt={episode.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="episode-placeholder">
                              <div class="play-icon">▶️</div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="episode-placeholder">
                        <div className="play-icon">▶️</div>
                      </div>
                    )}
                    
                    <div className="episode-number">
                      S{episode.season}E{episode.number}
                    </div>
                    
                    <div className="episode-watch-status unwatched">
                      👁️
                    </div>
                  </div>
                  
                  <div className="episode-content">
                    <div className="episode-header">
                      <h4 className="episode-title">{episode.name}</h4>
                      
                      <div className="episode-meta">
                        {episode.airdate && (
                          <span className="episode-airdate">
                            {new Date(episode.airdate).toLocaleDateString()}
                          </span>
                        )}
                        {episode.rating.average && (
                          <span className="episode-rating">
                            ⭐ {episode.rating.average}
                          </span>
                        )}
                        {episode.runtime && (
                          <span className="episode-runtime">
                            {episode.runtime}min
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {episode.summary && (
                      <p className="episode-summary">
                        {stripHtml(episode.summary)}
                      </p>
                    )}
                    
                    <div className="episode-actions">
                      <button className="episode-watch-btn unwatched">
                        <span>👁️</span>
                        Marcar como visto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowDetailsPage;
