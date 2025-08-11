import React from 'react';
import { TrackedShow } from '../types';
import ProgressBarDetailed from './ProgressBarDetailed';

interface ShowHeaderProps {
  trackedShow: TrackedShow;
  progress: number;
  watched: number;
  total: number;
  lastWatched: string | null;
  onMarkNext: () => void;
  onRemove: () => void;
  disableMarkNext: boolean;
  getImageUrl: () => string;
  getNextEpisodeToWatch: () => any;
}

const ShowHeader: React.FC<ShowHeaderProps> = ({
  trackedShow,
  progress,
  watched,
  total,
  lastWatched,
  onMarkNext,
  onRemove,
  disableMarkNext,
  getImageUrl,
  getNextEpisodeToWatch
}) => {
  return (
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
        <ProgressBarDetailed progress={progress} watched={watched} total={total} />
        {lastWatched && (
          <p className="last-watched-detailed">
            Último visto: {new Date(lastWatched).toLocaleDateString()}
          </p>
        )}
        <div className="tracked-show-actions-detailed">
          <button
            onClick={onMarkNext}
            className="mark-next-button"
            disabled={disableMarkNext || !getNextEpisodeToWatch()}
          >
            ➜ Marcar siguiente
          </button>
          <button
            onClick={onRemove}
            className="remove-button-detailed"
          >
            ✕ Dejar de seguir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowHeader;
