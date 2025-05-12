/**
 * Composant Layout
 * Ce composant combine les différents éléments de mise en page (Header, Sidebar, Footer)
 * pour créer la structure principale de l'application
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '../../contexts/ThemeContext';
import { ProjectProvider } from '../../contexts/ProjectContext';

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme } = useTheme();
    const location = useLocation();

    // Gérer le redimensionnement de la fenêtre pour le comportement responsive
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        handleResize(); // Appliquer au chargement initial
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fermer le menu latéral sur mobile lors du changement de route
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    // Effet de transition pour le contenu principal
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    };

    return (
        <ProjectProvider>
            <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${theme}`}>
                {/* Header */}
                <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Contenu principal */}
                <main className={`pt-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        <motion.div
                            key={location.pathname}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>
        </ProjectProvider>
    );
};

export default Layout;