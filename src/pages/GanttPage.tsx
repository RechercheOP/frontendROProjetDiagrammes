/**
 * Page du diagramme Gantt
 * Cette page affiche et permet d'éditer un diagramme Gantt spécifique
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import GanttChart from '../components/gantt/GanttChart';
import { useProject } from '../hooks/useProject';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../models/Task';
import { formatDate } from '../utils/dateUtils';

const GanttPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { project, loading, error, updateProject } = useProject(projectId || null);
    const { tasks, addTask, updateTask, deleteTask } = useTasks(projectId || null);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentView, setCurrentView] = useState<'chart' | 'list'>('chart');
    const chartContainerRef = useRef<HTMLDivElement>(null);

    // Données du formulaire de nouvelle tâche
    const [newTaskData, setNewTaskData] = useState({
        name: '',
        duration: 1,
        dependencies: [] as string[],
        progress: 0,
    });

    // Effet pour gérer le plein écran
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Fonction pour basculer en plein écran
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            chartContainerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Gérer l'ajout d'une nouvelle tâche
    const handleAddTask = () => {
        if (newTaskData.name.trim() === '') return;

        addTask(
            newTaskData.name,
            newTaskData.duration,
            newTaskData.dependencies
        );

        // Réinitialiser le formulaire
        setNewTaskData({
            name: '',
            duration: 1,
            dependencies: [],
            progress: 0,
        });

        setShowNewTaskModal(false);
    };

    // Gérer la mise à jour d'une tâche
    const handleUpdateTask = () => {
        if (!selectedTask) return;

        updateTask(selectedTask.id, selectedTask);
        setShowEditTaskModal(false);
        setSelectedTask(null);
    };

    // Gérer la sélection d'une tâche pour édition
    const handleTaskSelect = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setSelectedTask({...task});
            setShowEditTaskModal(true);
        }
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
        <div className="space-y-6" ref={chartContainerRef}>
            {/* En-tête du projet */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white text-white dark:text-gray-900">
                Diagramme Gantt
              </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                Créé le {formatDate(project.createdAt)}
              </span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>

                        {project.description && (
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                                {project.description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowNewTaskModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Nouvelle tâche</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
                            >
                                {isFullscreen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Options d'affichage */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                onClick={() => setCurrentView('chart')}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${
                                    currentView === 'chart'
                                        ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Diagramme
                            </button>

                            <button
                                onClick={() => setCurrentView('list')}
                                className={`px-3 py-1 text-sm rounded-md transition-all ${
                                    currentView === 'list'
                                        ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Liste des tâches
                            </button>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">{tasks.length}</span> tâches
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Résumé:</span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium">
              Durée: {tasks.reduce((total, task) => total + task.duration, 0)} jours
            </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium">
              Progression: {Math.round(tasks.reduce((total, task) => total + task.progress, 0) / (tasks.length || 1))}%
            </span>
                    </div>
                </div>
            </div>

            {/* Corps principal - Affichage du diagramme ou de la liste */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm min-h-[500px] p-6 border border-gray-200 dark:border-gray-700">
                <AnimatePresence mode="wait">
                    {currentView === 'chart' ? (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {tasks.length > 0 ? (
                                <GanttChart projectId={projectId} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-96 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Aucune tâche
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                                        Commencez par ajouter des tâches à votre projet pour visualiser votre diagramme de Gantt.
                                    </p>
                                    <button
                                        onClick={() => setShowNewTaskModal(true)}
                                        className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:-translate-y-1"
                                    >
                                        Ajouter une tâche
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {tasks.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Nom
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Début
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Fin
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Durée
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Progression
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Dépendances
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {tasks.map((task) => (
                                            <tr
                                                key={task.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {task.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(task.start)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(task.end)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {task.duration} jour{task.duration > 1 ? 's' : ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                                            <div
                                                                className="bg-black dark:bg-white h-2 rounded-full"
                                                                style={{ width: `${task.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                {task.progress}%
                              </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {task.dependencies.length > 0 ? (
                                                        <span className="inline-flex items-center">
                                {task.dependencies.map((depId) => {
                                    const depTask = tasks.find(t => t.id === depId);
                                    return depTask ? (
                                        <span key={depId} className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs mr-1 mb-1">
                                      {depTask.name}
                                    </span>
                                    ) : null;
                                })}
                              </span>
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleTaskSelect(task.id)}
                                                        className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 mr-3"
                                                    >
                                                        Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) {
                                                                deleteTask(task.id);
                                                            }
                                                        }}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                                    >
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-96 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Aucune tâche
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                                        Commencez par ajouter des tâches à votre projet pour visualiser votre diagramme de Gantt.
                                    </p>
                                    <button
                                        onClick={() => setShowNewTaskModal(true)}
                                        className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all transform hover:-translate-y-1"
                                    >
                                        Ajouter une tâche
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal pour ajouter une nouvelle tâche */}
            <AnimatePresence>
                {showNewTaskModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black"
                            onClick={() => setShowNewTaskModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md z-10"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nouvelle tâche</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom de la tâche *
                                    </label>
                                    <input
                                        type="text"
                                        id="task-name"
                                        placeholder="Nom de la tâche"
                                        value={newTaskData.name}
                                        onChange={(e) => setNewTaskData({...newTaskData, name: e.target.value})}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="task-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Durée (en jours) *
                                    </label>
                                    <input
                                        type="number"
                                        id="task-duration"
                                        min="1"
                                        value={newTaskData.duration}
                                        onChange={(e) => setNewTaskData({...newTaskData, duration: parseInt(e.target.value) || 1})}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Dépendances
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        {tasks.length > 0 ? (
                                            tasks.map((task) => (
                                                <div key={task.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`dep-${task.id}`}
                                                        checked={newTaskData.dependencies.includes(task.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewTaskData({
                                                                    ...newTaskData,
                                                                    dependencies: [...newTaskData.dependencies, task.id]
                                                                });
                                                            } else {
                                                                setNewTaskData({
                                                                    ...newTaskData,
                                                                    dependencies: newTaskData.dependencies.filter(id => id !== task.id)
                                                                });
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white rounded"
                                                    />
                                                    <label htmlFor={`dep-${task.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        {task.name}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                                Aucune tâche existante
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowNewTaskModal(false)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddTask}
                                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                    disabled={newTaskData.name.trim() === ''}
                                >
                                    Ajouter
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal pour éditer une tâche existante */}
            <AnimatePresence>
                {showEditTaskModal && selectedTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black"
                            onClick={() => setShowEditTaskModal(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md z-10"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Modifier la tâche</h2>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit-task-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom de la tâche *
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-task-name"
                                        placeholder="Nom de la tâche"
                                        value={selectedTask.name}
                                        onChange={(e) => setSelectedTask({...selectedTask, name: e.target.value})}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-task-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Durée (en jours) *
                                    </label>
                                    <input
                                        type="number"
                                        id="edit-task-duration"
                                        min="1"
                                        value={selectedTask.duration}
                                        onChange={(e) => setSelectedTask({...selectedTask, duration: parseInt(e.target.value) || 1})}
                                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-task-progress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Progression ({selectedTask.progress}%)
                                    </label>
                                    <input
                                        type="range"
                                        id="edit-task-progress"
                                        min="0"
                                        max="100"
                                        value={selectedTask.progress}
                                        onChange={(e) => setSelectedTask({...selectedTask, progress: parseInt(e.target.value)})}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Dépendances
                                    </label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        {tasks.filter(t => t.id !== selectedTask.id).length > 0 ? (
                                            tasks.filter(t => t.id !== selectedTask.id).map((task) => (
                                                <div key={task.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`edit-dep-${task.id}`}
                                                        checked={selectedTask.dependencies.includes(task.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedTask({
                                                                    ...selectedTask,
                                                                    dependencies: [...selectedTask.dependencies, task.id]
                                                                });
                                                            } else {
                                                                setSelectedTask({
                                                                    ...selectedTask,
                                                                    dependencies: selectedTask.dependencies.filter(id => id !== task.id)
                                                                });
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white rounded"
                                                    />
                                                    <label htmlFor={`edit-dep-${task.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        {task.name}
                                                    </label>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                                                Aucune autre tâche disponible
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditTaskModal(false)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="button"
                                    onClick={handleUpdateTask}
                                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                    disabled={selectedTask.name.trim() === ''}
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GanttPage;