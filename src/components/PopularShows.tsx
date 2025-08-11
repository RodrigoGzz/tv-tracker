import React, { useState, useEffect, useCallback } from 'react';
import { Show } from '../types';
import { getPopularShows } from '../services/tvmaze';
import ShowCard from './ShowCard';
import LoadingSpinner from './LoadingSpinner';
import { useApp } from '../context/AppContext';

const PopularShows: React.FC = () => {
  const { trackedShows, loading: contextLoading } = useApp(); // removed unused isShowTracked
  const [popularShows, setPopularShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explodingShows, setExplodingShows] = useState<Set<number>>(new Set());
  const [allShowsCache, setAllShowsCache] = useState<Show[]>([]);

  const SHOWS_PER_PAGE = 9;

  const getExcludedIds = useCallback(() => trackedShows.map((t) => t.show.id), [trackedShows]);

  const updateDisplayedShows = useCallback(() => {
    const excludedIds = getExcludedIds();
    const filteredShows = allShowsCache.filter((show) => !excludedIds.includes(show.id));
    const startIndex = currentPage * SHOWS_PER_PAGE;
    const endIndex = startIndex + SHOWS_PER_PAGE;
    const pageShows = filteredShows.slice(startIndex, endIndex);
    setPopularShows(pageShows);
    setHasMore(endIndex < filteredShows.length);
  }, [allShowsCache, currentPage, getExcludedIds]);

  const handleShowTracked = async (showId: number) => {
    // Agregar a la lista de shows que van a explotar
    setExplodingShows((prev) => new Set(prev).add(showId));

    // Después de la animación, actualizar la vista
    setTimeout(async () => {
      try {
        // Remover el show de la lista actual inmediatamente
        setPopularShows((prev) => prev.filter((show) => show.id !== showId));

        // Actualizar el cache para excluir el show recién agregado
        const excludedIds = [...getExcludedIds(), showId];
        const filteredCache = allShowsCache.filter((show) => !excludedIds.includes(show.id));

        // Calcular cuántos shows necesitamos para llenar la página actual
        const startIndex = currentPage * SHOWS_PER_PAGE;
        const endIndex = startIndex + SHOWS_PER_PAGE;
        const availableShows = filteredCache.slice(startIndex, endIndex);

        // Si no tenemos suficientes shows en cache, cargar más
        if (availableShows.length < SHOWS_PER_PAGE && hasMore) {
          const additionalResult = await getPopularShows(0, excludedIds, SHOWS_PER_PAGE * 20);
          setAllShowsCache(additionalResult.shows);

          // Usar el nuevo cache para obtener los shows de la página actual
          const newFilteredShows = additionalResult.shows.filter(
            (show) => !excludedIds.includes(show.id)
          );
          const newPageShows = newFilteredShows.slice(startIndex, endIndex);

          setPopularShows(newPageShows);
          setHasMore(endIndex < newFilteredShows.length);
        } else {
          // Usar el cache existente
          setPopularShows(availableShows);
          setHasMore(endIndex < filteredCache.length);
        }
      } catch (error) {
        console.error('Error loading replacement show:', error);
        // En caso de error, al menos actualizar con el cache actual
        updateDisplayedShows();
      } finally {
        setExplodingShows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(showId);
          return newSet;
        });
      }
    }, 600);
  };

  const ExplodingShowCard: React.FC<{ show: Show }> = ({ show }) => {
    const isExploding = explodingShows.has(show.id);

    const createParticles = () => {
      const particles = [];
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 * Math.PI) / 180;
        const distance = 100 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particles.push(
          <div
            key={i}
            className="particle"
            style={
              {
                '--particle-direction': `translate(${x}px, ${y}px)`,
                animationDelay: `${Math.random() * 0.1}s`,
              } as React.CSSProperties
            }
          />
        );
      }
      return particles;
    };

    return (
      <div style={{ position: 'relative' }}>
        <div className={isExploding ? 'show-card-exploding' : ''}>
          <ShowCard show={show} onTrack={() => handleShowTracked(show.id)} />
        </div>
        {isExploding && <div className="explosion-particles">{createParticles()}</div>}
      </div>
    );
  };

  const loadInitialShows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const excludedIds = getExcludedIds();
      const result = await getPopularShows(0, excludedIds, SHOWS_PER_PAGE * 15);
      setAllShowsCache(result.shows);
      const filteredShows = result.shows.filter((show) => !excludedIds.includes(show.id));
      const pageShows = filteredShows.slice(0, SHOWS_PER_PAGE);
      setPopularShows(pageShows);
      setHasMore(SHOWS_PER_PAGE < filteredShows.length);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error loading initial shows:', error);
      setError('Error al cargar las series populares');
    } finally {
      setLoading(false);
    }
  }, [getExcludedIds]);

  // Solo cargar cuando el contexto haya terminado de cargar
  useEffect(() => {
    if (!contextLoading) {
      loadInitialShows();
    }
  }, [contextLoading, loadInitialShows]);

  // Recargar cuando cambien las series seguidas - pero no durante la animación
  useEffect(() => {
    if (allShowsCache.length > 0 && explodingShows.size === 0 && !contextLoading) {
      updateDisplayedShows();
    }
  }, [
    trackedShows,
    currentPage,
    contextLoading,
    allShowsCache,
    explodingShows,
    updateDisplayedShows,
  ]);

  const loadNextPage = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);
    try {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      const excludedIds = getExcludedIds();
      const filteredShows = allShowsCache.filter((show) => !excludedIds.includes(show.id));

      const startIndex = nextPage * SHOWS_PER_PAGE;
      const endIndex = startIndex + SHOWS_PER_PAGE;

      // Si necesitamos más shows, cargar más del API
      if (endIndex > filteredShows.length) {
        const additionalResult = await getPopularShows(0, excludedIds, SHOWS_PER_PAGE * 20);
        setAllShowsCache(additionalResult.shows);

        const newFilteredShows = additionalResult.shows.filter(
          (show) => !excludedIds.includes(show.id)
        );
        const pageShows = newFilteredShows.slice(startIndex, endIndex);

        setPopularShows(pageShows);
        setHasMore(endIndex < newFilteredShows.length);
      } else {
        const pageShows = filteredShows.slice(startIndex, endIndex);
        setPopularShows(pageShows);
        setHasMore(endIndex < filteredShows.length);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setCurrentPage(prevPage);

      const excludedIds = getExcludedIds();
      const filteredShows = allShowsCache.filter((show) => !excludedIds.includes(show.id));

      const startIndex = prevPage * SHOWS_PER_PAGE;
      const endIndex = startIndex + SHOWS_PER_PAGE;
      const pageShows = filteredShows.slice(startIndex, endIndex);

      setPopularShows(pageShows);
      setHasMore(endIndex < filteredShows.length);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading previous page:', error);
      setError('Error al cargar la página anterior');
    } finally {
      setLoadingMore(false);
    }
  };

  // Mostrar loading mientras el contexto está cargando O mientras estamos cargando shows
  if (contextLoading || loading) {
    return (
      <div className="popular-shows-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="popular-shows">
      <div className="popular-header">
        <h2>Series Populares</h2>
        <div className="page-info">
          <span>Página {currentPage + 1}</span>
          {trackedShows.length > 0 && <span className="excluded-info"></span>}
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
            {popularShows.map((show) => (
              <ExplodingShowCard key={show.id} show={show} />
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
