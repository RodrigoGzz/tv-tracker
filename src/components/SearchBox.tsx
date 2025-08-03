import React, { useState } from 'react';
import { SearchResult } from '../types';
import { searchShows } from '../services/tvmaze';
import ShowCard from './ShowCard';
import LoadingSpinner from './LoadingSpinner';

const SearchBox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await searchShows(query.trim());
      setResults(searchResults);
    } catch (error) {
      console.error('Error during search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-box">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar series y películas..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '...' : '🔍'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="search-loading">
          <LoadingSpinner />
          <p>Buscando...</p>
        </div>
      )}

      {hasSearched && !loading && (
        <div className="search-results">
          {results.length > 0 ? (
            <>
              <h3>Resultados de búsqueda ({results.length})</h3>
              <div className="shows-grid">
                {results.map((result) => (
                  <ShowCard key={result.show.id} show={result.show} />
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <p>No se encontraron resultados para "{query}"</p>
              <p>Intenta con otros términos de búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
