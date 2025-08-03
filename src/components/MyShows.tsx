import React from 'react';
import { useApp } from '../context/AppContext';
import TrackedShowCard from './TrackedShowCard';
import LoadingSpinner from './LoadingSpinner';

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
  const recentlyWatched = trackedShows
    .filter(show => show.lastWatched)
    .sort((a, b) => new Date(b.lastWatched!).getTime() - new Date(a.lastWatched!).getTime())
    .slice(0, 3);

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

      {recentlyWatched.length > 0 && (
        <div className="recently-watched-section">
          <h2>Visto recientemente</h2>
          <div className="recently-watched-list">
            {recentlyWatched.map(show => (
              <div key={show.id} className="recent-show-item">
                <img 
                  src={show.show.image?.medium || '/placeholder-show.jpg'} 
                  alt={show.show.name}
                  className="recent-show-image"
                />
                <div className="recent-show-info">
                  <h4>{show.show.name}</h4>
                  <p>Último episodio: {new Date(show.lastWatched!).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tracked-shows-list">
        <h2>Todas las series ({totalShows})</h2>
        <div className="shows-container">
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
              <TrackedShowCard 
                key={trackedShow.id} 
                trackedShow={trackedShow} 
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MyShows;
