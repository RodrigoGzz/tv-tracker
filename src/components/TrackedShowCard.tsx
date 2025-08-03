import React, { useState, useEffect } from 'react';
import { TrackedShow, Episode } from '../types';
import { useApp } from '../context/AppContext';
import { getShowEpisodes } from '../services/tvmaze';
import { markEpisodeWatched, markEpisodeUnwatched, markMultipleEpisodesWatched, isEpisodeWatched } from '../services/localStorage';
import { getPreviousUnwatchedEpisodes, canWatchEpisodeNext } from '../utils/episodeUtils';
import LoadingSpinner from './LoadingSpinner';
import SkipEpisodesModal from './SkipEpisodesModal';

interface TrackedShowCardProps {
  trackedShow: TrackedShow;
}

const TrackedShowCard: React.FC<TrackedShowCardProps> = ({ trackedShow }) => {
  const { removeShow, updateShow } = useApp();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [pendingEpisode, setPendingEpisode] = useState<Episode | null>(null);
  const [skippedEpisodes, setSkippedEpisodes] = useState<Episode[]>([]);

  const { show } = trackedShow;

  useEffect(() => {
    if (showEpisodes && episodes.length === 0) {
      loadEpisodes();
    }
  }, [showEpisodes]);

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const episodeList = await getShowEpisodes(show.id);
      setEpisodes(episodeList);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeToggle = (episode: Episode) => {
    const isWatched = isEpisodeWatched(show.id, episode.id);
    
    if (isWatched) {
      // Si está marcado como visto, simplemente desmarcarlo
      markEpisodeUnwatched(show.id, episode.id);
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
        markEpisodeWatched(show.id, episode.id);
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
    if (!pendingEpisode) return;
    
    // Marcar todos los episodios anteriores y el actual como vistos
    const episodeIdsToMark = [...skippedEpisodes.map(ep => ep.id), pendingEpisode.id];
    markMultipleEpisodesWatched(show.id, episodeIdsToMark);
    
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
    if (!pendingEpisode) return;
    
    // Marcar solo el episodio seleccionado como visto
    markEpisodeWatched(show.id, pendingEpisode.id);
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
    return trackedShow.watchedEpisodes.length;
  };

  const getTotalEpisodes = () => {
    return episodes.length;
  };

  const getProgress = () => {
    if (episodes.length === 0) return 0;
    return Math.round((getWatchedCount() / getTotalEpisodes()) * 100);
  };

  const getImageUrl = () => {
    return show.image?.medium || show.image?.original || '/placeholder-show.jpg';
  };

  const seasons = getSeasons();

  return (
    <div className="tracked-show-card">
      <div className="tracked-show-header">
        <img 
          src={getImageUrl()}
          alt={show.name}
          className="tracked-show-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-show.jpg';
          }}
        />
        
        <div className="tracked-show-info">
          <h3>{show.name}</h3>
          <p className="show-status">{show.status}</p>
          
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {getWatchedCount()}/{getTotalEpisodes()} episodios ({getProgress()}%)
            </span>
          </div>
          
          {trackedShow.lastWatched && (
            <p className="last-watched">
              Último visto: {new Date(trackedShow.lastWatched).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="tracked-show-actions">
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="episodes-toggle"
          >
            {showEpisodes ? 'Ocultar episodios' : 'Ver episodios'}
          </button>
          <button
            onClick={() => removeShow(show.id)}
            className="remove-button"
          >
            ✕ Dejar de seguir
          </button>
        </div>
      </div>

      {showEpisodes && (
        <div className="episodes-section">
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
                    className={`episode-item ${isEpisodeWatched(show.id, episode.id) ? 'watched' : ''}`}
                  >
                    <label className="episode-checkbox">
                      <input
                        type="checkbox"
                        checked={isEpisodeWatched(show.id, episode.id)}
                        onChange={() => handleEpisodeToggle(episode)}
                      />
                      <span className="checkmark"></span>
                    </label>
                    
                    <div className="episode-info">
                      <span className="episode-number">
                        S{episode.season}E{episode.number}
                      </span>
                      <span className="episode-name">{episode.name}</span>
                      {episode.airdate && (
                        <span className="episode-date">
                          {new Date(episode.airdate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

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

export default TrackedShowCard;
