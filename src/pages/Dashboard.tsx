/**
 * Tableau de bord (Dashboard)
 * Cette page est le hub central où les utilisateurs peuvent voir leurs projets
 * et accéder aux différentes fonctionnalités de l'application
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProject';
import { formatDate } from '../utils/dateUtils';
import { calculateProjectProgress } from '../utils/chartUtils';
import { Project } from '../models/Project';

const Dashboard: React.FC = () => {
    const { projects, loading, createProject, removeProject, loadProjects } = useProjects();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectType, setNewProjectType] = useState<'gantt' | 'pert'>('gantt');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [filter, setFilter] = useState<'all' | 'gantt' | 'pert'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'progress'>('date');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Recharger les projets au montage
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Filtrer et trier les projets
    const filteredProjects = projects
        .filter((project) => {
            // Filtrer par type
            if (filter !== 'all' && project.type !== filter) {
                return false;
            }

            // Filtrer par recherche
            if (searchQuery.trim() !== '') {
                return (
                    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            return true;
        })
        .sort((a, b) => {
            // Trier par critère
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);

                case 'progress':
                    return calculateProjectProgress(b.tasks) - calculateProjectProgress(a.tasks);

                case 'date':
                default:
                    const dateA = new Date(a.updatedAt).getTime();
                    const dateB = new Date(b.updatedAt).getTime();
                    return dateB - dateA;
            }
        });

    // Créer un nouveau projet
    const handleCreateProject = () => {
        if (newProjectName.trim() === '') return;

        const projectId = createProject(
            newProjectName,
            newProjectDescription,
            newProjectType
        );

        if (projectId) {
            setShowNewProjectModal(false);
            setNewProjectName('');
            setNewProjectDescription('');

            // Naviguer vers le nouveau projet
            navigate(`/${newProjectType}/${projectId}`);
        }
    };

    // Supprimer un projet
    const handleDeleteProject = (projectId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            removeProject(projectId);
        }
    };

    // Style de la carte de projet
    const getProjectCardClass = (type: 'gantt' | 'pert') => {
        const baseClass = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1";

        return baseClass;
    };

    return (
        <div>
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Tableau de bord
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Gérez vos projets et créez de nouveaux diagrammes Gantt et PERT.
                    </p>
                </motion.div>
            </div>

            {/* Barre d'outils */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow w-full sm:w-64"
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
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Filtre:</span>
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                                        filter === 'all'
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Tous
                                </button>
                                <button
                                    onClick={() => setFilter('gantt')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                                        filter === 'gantt'
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    Gantt
                                </button>
                                <button
                                    onClick={() => setFilter('pert')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                                        filter === 'pert'
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    PERT
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Trier par:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'progress')}
                                className="bg-gray-100 dark:bg-gray-700 border-0 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white px-3 py-2 text-gray-800 dark:text-gray-200"
                            >
                                <option value="date">Date de modification</option>
                                <option value="name">Nom</option>
                                <option value="progress">Progression</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Nouveau projet</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grille de projets */}
            <LayoutGroup>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-black dark:text-white"></div>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center border border-gray-200 dark:border-gray-700"
                    >
                        {searchQuery ? (
                            <>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Aucun résultat trouvé
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Essayez de modifier votre recherche ou de créer un nouveau projet.
                                </p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                                    Vous n'avez pas encore de projets
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Commencez par créer un nouveau projet pour visualiser vos diagrammes.
                                </p>
                                <button
                                    onClick={() => setShowNewProjectModal(true)}
                                    className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:-translate-y-1 transform shadow-sm"
                                >
                                    Créer un projet
                                </button>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onDelete={() => handleDeleteProject(project.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </LayoutGroup>

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
        </div>
    );
};

// Composant de carte de projet
// Modifier la déclaration du composant ProjectCard ainsi :

interface ProjectCardProps {
    project: Project;
    onDelete: () => void;
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(({ project, onDelete }, ref) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const progress = calculateProjectProgress(project.tasks);

    const badgeType = project.type === 'gantt'
        ? 'bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white'
        : 'bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-300';

    const badgeText = project.type === 'gantt' ? 'Gantt' : 'PERT';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all relative"
            ref={ref}
        >
            <Link to={`/${project.type}/${project.id}`} className="block">
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white dark:text-gray-900 ${badgeType}`}>
              {badgeText}
            </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
              Modifié le {formatDate(project.updatedAt)}
            </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                        {project.name}
                    </h3>

                    {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            {project.description}
                        </p>
                    )}

                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progression</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-black dark:bg-white h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            ></motion.div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{project.tasks.length} tâches</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Boutons d'actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 flex justify-between">
                <Link
                    to={`/${project.type}/${project.id}`}
                    className="text-sm font-medium text-black dark:text-white hover:underline flex items-center"
                >
                    <span>Ouvrir</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Link>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                    Supprimer
                </button>
            </div>

            {/* Modal de confirmation de suppression */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <div className="fixed inset-0 bg-black opacity-50"></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md z-10"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Confirmer la suppression
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ? Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={() => {
                                        onDelete();
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

ProjectCard.displayName = 'ProjectCard';


export default Dashboard;