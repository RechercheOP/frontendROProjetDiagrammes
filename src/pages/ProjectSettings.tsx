/**
 * Page des paramètres du projet
 * Cette page permet de configurer différentes options pour un projet
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate } from '../utils/dateUtils';

const ProjectSettings: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { project, loading, error, updateProject } = useProject(projectId || null);
    const { theme } = useTheme();

    // États pour les champs de formulaire
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Initialiser les champs avec les valeurs du projet
    useEffect(() => {
        if (project) {
            setProjectName(project.name);
            setProjectDescription(project.description || '');
        }
    }, [project]);

    // Gérer la soumission du formulaire
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!project) return;

        setIsSaving(true);

        // Mettre à jour le projet
        updateProject({
            ...project,
            name: projectName,
            description: projectDescription
        });

        // Afficher le message de succès
        setSaveSuccess(true);
        setTimeout(() => {
            setSaveSuccess(false);
        }, 3000);

        setIsSaving(false);
    };

    // Gérer la suppression du projet
    const handleDelete = () => {
        if (!project) return;

        // Supprimer le projet
        // removeProject(project.id);

        // Rediriger vers le tableau de bord
        navigate('/dashboard');
    };

    // UI pour l'état de chargement
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-black dark:text-white"></div>
            </div>
        );
    }

    // UI pour l'état d'erreur
    if (error || !project) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Projet non trouvé
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Le projet que vous cherchez n'existe pas ou a été supprimé.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:-translate-y-1"
                >
                    Retour au tableau de bord
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres du projet</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Gérez les paramètres de votre projet {project.type === 'gantt' ? 'Gantt' : 'PERT'}.
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(`/${project.type}/${project.id}`)}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Retour au projet
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Formulaire de paramètres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Colonne principale */}
                <div className="md:col-span-2 space-y-6">
                    {/* Informations générales */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Informations générales
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom du projet *
                                    </label>
                                    <input
                                        type="text"
                                        id="project-name"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
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
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving || projectName.trim() === ''}
                                        className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                </div>

                                {saveSuccess && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm">
                                        Modifications enregistrées avec succès.
                                    </div>
                                )}
                            </div>
                        </form>
                    </motion.div>

                    {/* Options d'exportation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            Exportation
                        </h2>

                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                Exportez votre projet sous différents formats pour le partager ou l'archiver.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Exporter en PNG</span>
                                </button>

                                <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span>Exporter en JSON</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Zone de danger */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-red-200 dark:border-red-900"
                    >
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-6">
                            Zone de danger
                        </h2>

                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                Les actions ci-dessous sont irréversibles. Soyez prudent.
                            </p>

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Supprimer ce projet</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Colonne latérale */}
                <div className="space-y-6">
                    {/* Informations du projet */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            À propos du projet
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Type de projet</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Diagramme {project.type === 'gantt' ? 'Gantt' : 'PERT'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Créé le</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(project.createdAt)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière modification</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(project.updatedAt)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre de tâches</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {project.tasks.length}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Astuces */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6"
                    >
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Astuces
                        </h2>

                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Exportez régulièrement vos projets pour éviter les pertes de données.</span>
                            </li>
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Vous pouvez modifier le nom et la description de votre projet à tout moment.</span>
                            </li>
                            <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Le calcul du chemin critique est automatique et se met à jour à chaque modification.</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black opacity-50"
                        onClick={() => setShowDeleteModal(false)}
                    />

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md z-10">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Confirmer la suppression
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer le projet "{project.name}" ? Cette action est irréversible.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSettings;