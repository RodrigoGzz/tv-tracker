import React from 'react';
import { Episode, TrackedShow } from '../types';
import { isEpisodeWatched } from '../services/localStorage';

interface EpisodeListProps {
  trackedShow: TrackedShow;
  episodes: Episode[];
  season: number;
  onToggle: (episode: Episode) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ trackedShow, episodes, season, onToggle }) => {
  const seasonEpisodes = episodes.filter((ep) => ep.season === season);
  return (
    <div className="episodes-list">
      {seasonEpisodes.map((episode) => {
        const watched = isEpisodeWatched(trackedShow.show.id, episode.id);
        return (
          <div
            key={episode.id}
            id={`episode-${episode.id}`}
            className={`episode-item ${watched ? 'watched' : ''}`}
            onClick={() => onToggle(episode)}
          >
            <label className="episode-checkbox" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={watched} onChange={() => onToggle(episode)} />
            </label>
            <div className="episode-info">
              <div className="episode-name">
                <span className="episode-code">
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
                <div className="episode-rating-inline">⭐ {episode.rating.average}</div>
              )}
            </div>
            <div className={`episode-status-indicator ${watched ? 'watched' : 'pending'}`}>
              {watched ? '✅' : '⏸️'}
              <span>{watched ? 'Visto' : 'Pendiente'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EpisodeList;
