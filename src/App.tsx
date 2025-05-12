/**
 * Composant principal de l'application
 * Ce fichier définit la structure de l'application et les routes
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GanttPage from './pages/GanttPage';
import PertPage from './pages/PertPage';
import ProjectSettings from './pages/ProjectSettings';
import NotFound from './pages/NotFound';
import './App.css';

// Composant pour défiler vers le haut lors du changement de page
const ScrollToTop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <>{children}</>;
};

function App() {
  return (
      <ThemeProvider>
        <Router>
          <ScrollToTop>
            <Routes>
              {/* Route pour la page d'accueil */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Landing />} />

                {/* Routes pour le tableau de bord et les projets */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="gantt/:projectId" element={<GanttPage />} />
                <Route path="pert/:projectId" element={<PertPage />} />

                {/* Route pour les paramètres */}
                <Route path="settings/:projectId" element={<ProjectSettings />} />

                {/* Route 404 pour les pages non trouvées */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ScrollToTop>
        </Router>
      </ThemeProvider>
  );
}

export default App;