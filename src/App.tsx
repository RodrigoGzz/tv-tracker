import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import PopularShows from './components/PopularShows';
import MyShows from './components/MyShows';
import SearchBox from './components/SearchBox';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discover');

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <PopularShows />;
      case 'my-shows':
        return <MyShows />;
      case 'search':
        return <SearchBox />;
      default:
        return <PopularShows />;
    }
  };

  return (
    <AppProvider>
      <div className="App">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-content">
          {renderContent()}
        </main>
        <footer className="app-footer">
          <p>TV Tracker - Datos proporcionados por <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">TVMaze API</a></p>
        </footer>
      </div>
    </AppProvider>
  );
};

export default App;
