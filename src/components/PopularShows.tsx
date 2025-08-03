import React, { useState, useEffect } from 'react';
import { Show } from '../types';
import { getPopularShows } from '../services/tvmaze';
import ShowCard from './ShowCard';
import LoadingSpinner from './LoadingSpinner';

const PopularShows: React.FC = () => {
  const [popularShows, setPopularShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialShows();
  }, []);

  const loadInitialShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPopularShows(0);
      setPopularShows(result.shows);
      setHasMore(result.hasMore);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error loading initial shows:', error);
      setError('Error al cargar las series populares');
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = currentPage + 1;
      const result = await getPopularShows(nextPage);
      
      if (result.shows.length > 0) {
        setPopularShows(result.shows);
        setCurrentPage(nextPage);
        setHasMore(result.hasMore);
        
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading next page:', error);
      setError('Error al cargar más series');
    } finally {
      setLoadingMore(false);
    }
  };

  const loadPreviousPage = async () => {
    if (loadingMore || currentPage === 0) return;
    
    setLoadingMore(true);
    setError(null);
    try {
      const prevPage = currentPage - 1;
      const result = await getPopularShows(prevPage);
      
      setPopularShows(result.shows);
      setCurrentPage(prevPage);
      setHasMore(true);
      
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading previous page:', error);
      setError('Error al cargar la página anterior');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="popular-shows-loading">
        <LoadingSpinner />
        <p>Cargando series populares...</p>
      </div>
    );
  }

  return (
    <div className="popular-shows">
      <div className="popular-header">
        <h2>Series Populares</h2>
        <div className="page-info">
          <span>Página {currentPage + 1}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadInitialShows} className="retry-button">
            Reintentar
          </button>
        </div>
      )}

      {popularShows.length > 0 ? (
        <>
          <div className="shows-grid">
            {popularShows.map(show => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>

          <div className="pagination-controls">
            <button
              onClick={loadPreviousPage}
              disabled={currentPage === 0 || loadingMore}
              className="pagination-button prev"
            >
              ← Página Anterior
            </button>

            <div className="pagination-info">
              <span>Página {currentPage + 1}</span>
              {loadingMore && <LoadingSpinner />}
            </div>

            <button
              onClick={loadNextPage}
              disabled={!hasMore || loadingMore}
              className="pagination-button next"
            >
              Página Siguiente →
            </button>
          </div>
        </>
      ) : (
        <div className="no-shows">
          <p>No se pudieron cargar las series populares.</p>
          <button onClick={loadInitialShows} className="retry-button">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};

export default PopularShows;
