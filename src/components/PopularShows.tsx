import React, { useState, useEffect } from 'react';
import { Show, ScheduleItem } from '../types';
import { getPopularShows, getTodaySchedule } from '../services/tvmaze';
import ShowCard from './ShowCard';
import LoadingSpinner from './LoadingSpinner';

const PopularShows: React.FC = () => {
  const [popularShows, setPopularShows] = useState<Show[]>([]);
  const [todayShows, setTodayShows] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'popular' | 'today'>('popular');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [popular, today] = await Promise.all([
        getPopularShows(),
        getTodaySchedule()
      ]);
      
      setPopularShows(popular);
      setTodayShows(today);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="popular-shows-loading">
        <LoadingSpinner />
        <p>Cargando contenido...</p>
      </div>
    );
  }

  return (
    <div className="popular-shows">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          Series Populares
        </button>
        <button 
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Programación de Hoy
        </button>
      </div>

      {activeTab === 'popular' && (
        <div className="popular-content">
          <h2>Series Populares</h2>
          {popularShows.length > 0 ? (
            <div className="shows-grid">
              {popularShows.map(show => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          ) : (
            <p>No se pudieron cargar las series populares.</p>
          )}
        </div>
      )}

      {activeTab === 'today' && (
        <div className="today-content">
          <h2>Programación de Hoy</h2>
          {todayShows.length > 0 ? (
            <div className="today-shows">
              {todayShows.slice(0, 20).map((item, index) => (
                <div key={index} className="today-show-item">
                  <ShowCard show={item.show} />
                  <div className="episode-info">
                    <p><strong>Episodio de hoy:</strong></p>
                    <p>S{item.season || '?'}E{item.number || '?'} - {item.name || 'Sin título'}</p>
                    {item.airtime && (
                      <p>Hora: {item.airtime}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay programación disponible para hoy.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PopularShows;
