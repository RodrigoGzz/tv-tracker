import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe.</p>
        <div className="not-found-actions">
          <Link to="/" className="home-button">
            🏠 Volver al inicio
          </Link>
          <Link to="/search" className="search-button">
            🔍 Buscar series
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
