import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import DiscoverPage from './pages/DiscoverPage';
import MyShowsPage from './pages/MyShowsPage';
import SearchPage from './pages/SearchPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import ShowDetailsPage from './pages/ShowDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DiscoverPage />} />
              <Route path="/my-shows" element={<MyShowsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/show/:id" element={<ShowDetailsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>TV Tracker - Datos proporcionados por <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">TVMaze API</a></p>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
