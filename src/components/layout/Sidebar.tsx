/**
 * Composant Sidebar
 * Ce composant est le menu latéral de l'application
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjects } from '../../hooks/useProject';
import { Project } from '../../models/Project';
import { useProjectContext } from '../../contexts/ProjectContext';
import { classNames } from '../../utils/uiUtils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { projects, loading, createProject } = useProjects();
    const { setCurrentProjectId, currentProjectId } = useProjectContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        projects: true,
        gantt: true,
        pert: true,
    });
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState<'gantt' | 'pert'>('gantt');
    const [newProjectDescription, setNewProjectDescription] = useState('');

    // Récupérer les projets filtrés par le terme de recherche
    const filteredProjects = searchQuery.trim() === ''
        ? projects
        : projects.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    // Regrouper les projets par type
    const ganttProjects = filteredProjects.filter(p => p.type === 'gantt');
    const pertProjects = filteredProjects.filter(p => p.type === 'pert');

    // Effet pour fermer le menu latéral sur mobile lors du changement de route
    useEffect(() => {
        const handleRouteChange = () => {
            if (window.innerWidth < 1024) {
                onClose();
            }
        };

        return () => {
            handleRouteChange();
        };
    }, [location.pathname, onClose]);

    // Gérer le basculement des sections
    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Créer un nouveau projet
    const handleCreateProject = () => {
        if (newProjectName.trim() === '') return;

        const projectId = createProject(
            newProjectName,
            newProjectDescription,
            newProjectType
        );

        if (projectId) {
            setCurrentProjectId(projectId);
            setShowNewProjectModal(false);
            setNewProjectName('');
            setNewProjectDescription('');
            setNewProjectType('gantt');
        }
    };

    // Vérifier si un élément est actif
    const isActive = (path: string) => location.pathname === path;

    // Animations pour le menu latéral
    const sidebarVariants = {
        open: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: '-100%',
            opacity: 0.5,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    // Rendu du composant de projet
    const renderProjectItem = (project: Project) => (
        <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="ml-2 mb-1"
        >
            <Link
                to={`/${project.type}/${project.id}`}
                className={classNames(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all",
                    project.id === currentProjectId
                        ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => setCurrentProjectId(project.id)}
            >
                <div
                    className={classNames(
                        "w-2 h-2 rounded-full",
                        project.id === currentProjectId
                            ? "bg-white dark:bg-black"
                            : "bg-gray-400 dark:bg-gray-500"
                    )}
                />
                <span className="truncate">{project.name}</span>
            </Link>
        </motion.div>
    );

    return (
        <>
            {/* Overlay pour fermer le menu sur mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black z-20 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Menu latéral */}
            <motion.aside
                variants={sidebarVariants}
                initial={false}
                animate={isOpen ? 'open' : 'closed'}
                className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl z-30 pt-20 transition-transform transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Barre de recherche */}
                    <div className="px-4 mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher un projet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 absolute left-3 top-2.5 text-gray-500 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Menu de navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                        {/* Liens principaux */}
                        <Link
                            to="/"
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                isActive('/')
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Accueil</span>
                        </Link>

                        <Link
                            to="/dashboard"
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                isActive('/dashboard')
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Tableau de bord</span>
                        </Link>

                        {/* Section de projets */}
                        <div className="pt-3 pb-1">
                            <div
                                onClick={() => toggleSection('projects')}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none">
                                    Projets
                                </h3>
                                <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 text-gray-500 dark:text-gray-400 transform transition-transform ${
                                            expandedSections.projects ? 'rotate-90' : ''
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <AnimatePresence>
                                {expandedSections.projects && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        {/* Section Gantt */}
                                        <div className="mt-2">
                                            <div
                                                onClick={() => toggleSection('gantt')}
                                                className="flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gantt ({ganttProjects.length})
                          </span>
                                                </div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-3 w-3 text-gray-500 dark:text-gray-400 transform transition-transform ${
                                                        expandedSections.gantt ? 'rotate-90' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>

                                            <AnimatePresence>
                                                {expandedSections.gantt && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        {ganttProjects.length > 0 ? (
                                                            ganttProjects.map(project => renderProjectItem(project))
                                                        ) : (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 py-2 px-5">
                                                                Aucun projet Gantt trouvé
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Section PERT */}
                                        <div className="mt-2">
                                            <div
                                                onClick={() => toggleSection('pert')}
                                                className="flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            PERT ({pertProjects.length})
                          </span>
                                                </div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`h-3 w-3 text-gray-500 dark:text-gray-400 transform transition-transform ${
                                                        expandedSections.pert ? 'rotate-90' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>

                                            <AnimatePresence>
                                                {expandedSections.pert && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        {pertProjects.length > 0 ? (
                                                            pertProjects.map(project => renderProjectItem(project))
                                                        ) : (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 py-2 px-5">
                                                                Aucun projet PERT trouvé
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                        {/* Liens supplémentaires */}
                        <Link
                            to="/settings"
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                                isActive('/settings')
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Paramètres</span>
                        </Link>

                        <a
                            href="#"
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Aide</span>
                        </a>
                    </nav>

                    {/* Bouton pour créer un nouveau projet */}
                    <div className="p-4">
                        <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Nouveau projet</span>
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Modal pour créer un nouveau projet */}
            <AnimatePresence>
                {showNewProjectModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black"
                            onClick={() => setShowNewProjectModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md z-10"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nouveau projet</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom du projet *
                                    </label>
                                    <input
                                        type="text"
                                        id="project-name"
                                        placeholder="Mon nouveau projet"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="project-description"
                                        placeholder="Description du projet (optionnel)"
                                        value={newProjectDescription}
                                        onChange={(e) => setNewProjectDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type de projet
                                    </label>
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setNewProjectType('gantt')}
                                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                newProjectType === 'gantt'
                                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Gantt</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setNewProjectType('pert')}
                                            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                newProjectType === 'pert'
                                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>PERT</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowNewProjectModal(false)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCreateProject}
                                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                    disabled={newProjectName.trim() === ''}
                                >
                                    Créer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;