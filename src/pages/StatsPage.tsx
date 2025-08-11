import React from 'react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StatsPage: React.FC = () => {
  const { trackedShows, loading } = useApp();

  if (loading) {
    return (
      <div className="stats-loading">
        <LoadingSpinner />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  // Estadísticas detalladas
  const totalShows = trackedShows.length;
  const totalWatchedEpisodes = trackedShows.reduce(
    (sum, show) => sum + show.watchedEpisodes.length,
    0
  );
  const completedShows = trackedShows.filter((show) => show.isCompleted).length;
  const activeShows = trackedShows.filter((show) => !show.isCompleted).length;

  // Géneros más populares
  const genreCounts = trackedShows.reduce(
    (acc, show) => {
      show.show.genres.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const topGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Shows con más episodios vistos
  const topWatchedShows = trackedShows
    .filter((show) => show.watchedEpisodes.length > 0)
    .sort((a, b) => b.watchedEpisodes.length - a.watchedEpisodes.length)
    .slice(0, 5);

  // Tiempo de visualización estimado (asumiendo 45 minutos por episodio)
  const averageEpisodeLength = 45; // minutos
  const totalMinutesWatched = totalWatchedEpisodes * averageEpisodeLength;
  const totalHours = Math.round(totalMinutesWatched / 60);
  const totalDays = Math.round((totalHours / 24) * 10) / 10;

  // Series añadidas recientemente
  const recentlyAdded = trackedShows
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 5);

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>📊 Estadísticas de Visualización</h1>
        <p>Análisis detallado de tu actividad de series</p>
      </div>

      <div className="stats-grid">
        {/* Estadísticas generales */}
        <div className="stats-card">
          <h2>Resumen General</h2>
          <div className="stats-items">
            <div className="stat-item">
              <span className="stat-number">{totalShows}</span>
              <span className="stat-label">Series en total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{activeShows}</span>
              <span className="stat-label">Series activas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{completedShows}</span>
              <span className="stat-label">Series completadas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalWatchedEpisodes}</span>
              <span className="stat-label">Episodios vistos</span>
            </div>
          </div>
        </div>

        {/* Tiempo de visualización */}
        <div className="stats-card">
          <h2>Tiempo de Visualización</h2>
          <div className="stats-items">
            <div className="stat-item">
              <span className="stat-number">{totalHours}h</span>
              <span className="stat-label">Horas vistas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{totalDays}</span>
              <span className="stat-label">Días equivalentes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {Math.round(totalMinutesWatched / totalShows) || 0}min
              </span>
              <span className="stat-label">Promedio por serie</span>
            </div>
          </div>
        </div>

        {/* Géneros favoritos */}
        <div className="stats-card">
          <h2>Géneros Favoritos</h2>
          <div className="genre-list">
            {topGenres.length > 0 ? (
              topGenres.map(([genre, count]) => (
                <div key={genre} className="genre-item">
                  <span className="genre-name">{genre}</span>
                  <span className="genre-count">{count} series</span>
                  <div className="genre-bar">
                    <div
                      className="genre-fill"
                      style={{ width: `${(count / topGenres[0][1]) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p>No tienes series para mostrar géneros</p>
            )}
          </div>
        </div>

        {/* Series más vistas */}
        <div className="stats-card">
          <h2>Series Más Vistas</h2>
          <div className="top-shows-list">
            {topWatchedShows.length > 0 ? (
              topWatchedShows.map((trackedShow) => (
                <div key={trackedShow.id} className="top-show-item">
                  <img
                    src={trackedShow.show.image?.medium || '/placeholder-show.jpg'}
                    alt={trackedShow.show.name}
                    className="top-show-image"
                  />
                  <div className="top-show-info">
                    <h4>{trackedShow.show.name}</h4>
                    <p>{trackedShow.watchedEpisodes.length} episodios vistos</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Aún no has visto episodios de ninguna serie</p>
            )}
          </div>
        </div>

        {/* Series añadidas recientemente */}
        <div className="stats-card">
          <h2>Añadidas Recientemente</h2>
          <div className="recent-shows-list">
            {recentlyAdded.length > 0 ? (
              recentlyAdded.map((trackedShow) => (
                <div key={trackedShow.id} className="recent-show-item">
                  <img
                    src={trackedShow.show.image?.medium || '/placeholder-show.jpg'}
                    alt={trackedShow.show.name}
                    className="recent-show-image"
                  />
                  <div className="recent-show-info">
                    <h4>{trackedShow.show.name}</h4>
                    <p>Añadida el {new Date(trackedShow.addedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No tienes series en seguimiento</p>
            )}
          </div>
        </div>

        {/* Actividad semanal */}
        <div className="stats-card full-width">
          <h2>Progreso de Seguimiento</h2>
          <div className="progress-overview">
            {trackedShows.length > 0 ? (
              <div className="progress-stats">
                <p>
                  🎯 Promedio de finalización: {Math.round((completedShows / totalShows) * 100)}%
                </p>
                <p>
                  📈 Episodios promedio por serie:{' '}
                  {Math.round(totalWatchedEpisodes / totalShows) || 0}
                </p>
                <p>
                  ⏰ Última actividad:{' '}
                  {trackedShows
                    .filter((show) => show.lastWatched)
                    .sort(
                      (a, b) =>
                        new Date(b.lastWatched!).getTime() - new Date(a.lastWatched!).getTime()
                    )[0]?.lastWatched
                    ? new Date(
                        trackedShows
                          .filter((show) => show.lastWatched)
                          .sort(
                            (a, b) =>
                              new Date(b.lastWatched!).getTime() -
                              new Date(a.lastWatched!).getTime()
                          )[0].lastWatched!
                      ).toLocaleDateString()
                    : 'Sin actividad reciente'}
                </p>
              </div>
            ) : (
              <div className="no-data">
                <h3>¡Comienza tu viaje de series!</h3>
                <p>Añade algunas series a tu lista para ver estadísticas interesantes aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
