/**
 * Composant Header
 * Ce composant est l'en-tête principal de l'application
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjectContext } from '../../contexts/ProjectContext';

interface HeaderProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
    const { theme, toggleTheme } = useTheme();
    const { project } = useProjectContext();
    const [scrolled, setScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Écouter le défilement pour ajouter un effet de fond
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mettre à jour l'horloge
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Formater l'heure
    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 right-0 z-30 transition-all duration-200 ${
                scrolled
                    ? 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-full mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center py-4">
                    {/* Logo et bouton du menu latéral */}
                    <div className="flex items-center">
                        <button
                            onClick={onToggleSidebar}
                            className="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
                            aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-gray-800 dark:text-gray-200"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>

                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-black dark:bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                <motion.svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white dark:text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </motion.svg>
                            </div>
                            <span className="font-bold text-xl text-gray-800 dark:text-white">ProjectFlow</span>
                        </Link>
                    </div>

                    {/* Titre du projet courant - Animé lorsqu'il change */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={project?.id || 'no-project'}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="hidden sm:flex flex-col items-center"
                        >
                            {project ? (
                                <>
                                    <h1 className="text-lg font-medium text-gray-800 dark:text-white">
                                        {project.name}
                                    </h1>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                    {project.type === 'gantt' ? 'Diagramme de Gantt' : 'Diagramme PERT'}
                  </span>
                                </>
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Aucun projet sélectionné
                </span>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Actions et profil utilisateur */}
                    <div className="flex items-center space-x-4">
                        {/* Horloge */}
                        <motion.div
                            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
                            animate={{ opacity: [0.7, 1], scale: [0.98, 1] }}
                            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {formatTime(currentTime)}
              </span>
                        </motion.div>

                        {/* Bouton de thème */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
                            aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={theme}
                                    initial={{ rotate: -45, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 45, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {theme === 'dark' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </button>

                        {/* Menu de notifications */}
                        <div className="relative">
                            <button
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
                                aria-label="Notifications"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>

                        {/* Menu de profil utilisateur */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center space-x-2 focus:outline-none"
                                aria-label="Ouvrir le menu utilisateur"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-medium">
                                    RO
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">Recherche Op.</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrateur</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white flex items-center justify-center text-white dark:text-gray-900 text-lg font-medium">
                                                    RO
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">Recherche Opérationnelle</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">recherche.op@exemple.com</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <a href="#" className="group flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Profil</span>
                                            </a>
                                            <a href="#" className="group flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Paramètres</span>
                                            </a>
                                            <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                                            <a href="#" className="group flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Se déconnecter</span>
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;