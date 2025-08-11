import React from 'react';

interface ProgressBarDetailedProps {
  progress: number; // 0-100
  watched: number;
  total: number;
}

const ProgressBarDetailed: React.FC<ProgressBarDetailedProps> = ({ progress, watched, total }) => {
  return (
    <div className="progress-info-detailed">
      <div className="progress-bar-detailed">
        <div
          className="progress-fill-detailed"
          style={{ ['--progress-width' as any]: `${progress}%` }}
        />
      </div>
      <span className="progress-text-detailed">
        {watched}/{total} episodios ({progress}%)
      </span>
    </div>
  );
};

export default ProgressBarDetailed;
