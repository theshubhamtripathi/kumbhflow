import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Dashboard/Sidebar';
import Header from './components/Dashboard/Header';
import DashboardHome from './components/Dashboard/DashboardHome';
import SectorMap from './components/Map/SectorMap';
import PredictionEngine from './components/Predictor/PredictionEngine';
import RouteOptimizer from './components/Router/RouteOptimizer';
import AuthorityPanel from './components/Authority/AuthorityPanel';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardHome />;
      case 'map': return <SectorMap />;
      case 'prediction': return <PredictionEngine />;
      case 'routes': return <RouteOptimizer />;
      case 'authority': return <AuthorityPanel />;
      default: return <DashboardHome />;
    }
  };

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-darker)' }}>
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            activePage={activePage}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-grid-pattern">
            <div className="animate-fade-in">{renderPage()}</div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;