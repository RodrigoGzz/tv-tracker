import React from 'react';
import { Link } from 'react-router-dom';
import { Show, TrackedShow } from '../types';
import { useApp } from '../context/AppContext';

interface ShowCardProps {
  show: Show;
  isDetailed?: boolean;
  onTrack?: () => void; // Callback opcional cuando se sigue una serie
}

const ShowCard: React.FC<ShowCardProps> = ({ show, isDetailed = false, onTrack }) => {
  const { addShow, removeShow, isShowTracked } = useApp();
  const isTracked = isShowTracked(show.id);

  const handleToggleTracking = () => {
    if (isTracked) {
      removeShow(show.id);
    } else {
      const newTrackedShow: TrackedShow = {
        id: show.id,
        show,
        addedAt: new Date().toISOString(),
        watchedEpisodes: [],
        currentSeason: 1,
        currentEpisode: 1,
        lastWatched: null,
        isCompleted: false,
      };
      addShow(newTrackedShow);

      // Llamar al callback si existe (para la animación de explosión)
      if (onTrack) {
        onTrack();
      }
    }
  };

  const formatGenres = (genres: string[]) => {
    return genres.slice(0, 3).join(', ');
  };

  const stripHtml = (html: string | null) => {
    if (!html) return 'Sin descripción disponible';
    return html.replace(/<[^>]*>/g, '');
  };

  const getImageUrl = () => {
    return show.image?.medium || show.image?.original || '/placeholder-show.jpg';
  };

  return (
    <div className={`show-card ${isDetailed ? 'detailed' : ''}`}>
      <div className="show-image">
        <img
          src={getImageUrl()}
          alt={show.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-show.jpg';
          }}
        />
        <div className="show-rating">
          {show.rating.average ? `⭐ ${show.rating.average}` : 'Sin rating'}
        </div>
      </div>

      <div className="show-info">
        <h3 className="show-title">{show.name}</h3>

        {show.genres.length > 0 && <p className="show-genres">{formatGenres(show.genres)}</p>}

        <div className="show-details">
          {show.status && <span className="show-status">{show.status}</span>}
          {show.premiered && (
            <span className="show-year">({new Date(show.premiered).getFullYear()})</span>
          )}
          {show.network && <span className="show-network">{show.network.name}</span>}
        </div>

        {isDetailed && <p className="show-summary">{stripHtml(show.summary)}</p>}

        <div className="show-actions">
          <button
            onClick={handleToggleTracking}
            className={`track-button ${isTracked ? 'tracked' : 'untracked'}`}
          >
            {isTracked ? '✓ Siguiendo' : '+ Seguir'}
          </button>
          <Link to={`/show/${show.id}`} className="details-button">
            📖 Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShowCard;
