import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

// Removed local episodes count cache: now using trackedShow.totalEpisodes from context

const MyShows: React.FC = () => {
  const { trackedShows, loading } = useApp();

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
    const total = trackedShow.totalEpisodes;
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
                    style={{ ['--progress' as any]: `${getProgress(trackedShow)}%` }}
                  >
                    <div className="progress-text">
                      {trackedShow.totalEpisodes == null ? '...' : `${getProgress(trackedShow)}%`}
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
