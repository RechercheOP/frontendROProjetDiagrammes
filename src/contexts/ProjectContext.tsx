/**
 * Contexte pour gérer le projet actuel
 * Ce contexte permet de partager l'état du projet entre les composants
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    Project,
    Task,
    saveProject,
    getProject
} from '../services/localStorage/projectStorage';
import { validateGanttProject } from '../services/chart/ganttService';
import { validatePertProject } from '../services/chart/pertService';
import { useProject } from '../hooks/useProject';

// Interface pour le contexte de projet
interface ProjectContextType {
    currentProjectId: string | null;
    setCurrentProjectId: (id: string | null) => void;
    project: Project | null;
    loading: boolean;
    error: string | null;
    validationErrors: string[];
    updateProject: (project: Project | ((prev: Project) => Project)) => void;
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (taskId: string, task: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;
    reorderTasks: (taskIds: string[]) => void;
    criticalPath: string[];
    calculateCriticalPath: () => string[];
}

// Créer le contexte avec une valeur par défaut
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Props pour le ProjectProvider
interface ProjectProviderProps {
    children: ReactNode;
    initialProjectId?: string | null;
}

// Fournisseur de contexte pour le projet
export const ProjectProvider: React.FC<ProjectProviderProps> = ({
                                                                    children,
                                                                    initialProjectId = null
                                                                }) => {
    // État local pour l'ID du projet actuel
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProjectId);

    // État pour le projet actuel
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // État local pour le chemin critique
    const [criticalPath, setCriticalPath] = useState<string[]>([]);

    // Charger le projet actuel quand l'ID change
    useEffect(() => {
        if (!currentProjectId) {
            setProject(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const fetchedProject = getProject(currentProjectId);
            setProject(fetchedProject);

            // Valider le projet
            if (fetchedProject) {
                const errors = fetchedProject.type === 'gantt'
                    ? validateGanttProject(fetchedProject)
                    : validatePertProject(fetchedProject);

                setValidationErrors(errors);
            } else {
                setError('Projet non trouvé');
            }
        } catch (err) {
            setError(`Erreur lors du chargement du projet: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }, [currentProjectId]);

    // Mettre à jour le projet
    const updateProject = useCallback((updatedProject: Project | ((prev: Project) => Project)) => {
        if (!project) return;

        try {
            const newProject = updatedProject instanceof Function ? updatedProject(project) : updatedProject;

            // Mettre à jour la date de modification
            newProject.updatedAt = new Date().toISOString();

            // Sauvegarder le projet
            saveProject(newProject);

            // IMPORTANT: Mettre à jour l'état local immédiatement
            setProject(newProject);

            // Valider le projet mis à jour
            const errors = newProject.type === 'gantt'
                ? validateGanttProject(newProject)
                : validatePertProject(newProject);

            setValidationErrors(errors);

            // Recalculer le chemin critique si nécessaire
            calculateCriticalPath();
        } catch (err) {
            setError(`Erreur lors de la mise à jour du projet: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [project]);

    // Ajouter une tâche
    const addTask = useCallback((task: Omit<Task, 'id'>) => {
        if (!project) return;

        try {
            const newTask: Task = {
                ...task,
                id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            };

            updateProject(prev => ({
                ...prev,
                tasks: [...prev.tasks, newTask]
            }));
        } catch (err) {
            setError(`Erreur lors de l'ajout de la tâche: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [project, updateProject]);

    // Mettre à jour une tâche
    const updateTask = useCallback((taskId: string, updatedTask: Partial<Task>) => {
        if (!project) return;

        try {
            updateProject(prev => ({
                ...prev,
                tasks: prev.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                )
            }));
        } catch (err) {
            setError(`Erreur lors de la mise à jour de la tâche: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [project, updateProject]);

    // Supprimer une tâche
    const deleteTask = useCallback((taskId: string) => {
        if (!project) return;

        try {
            // Supprimer la tâche et toutes ses dépendances
            updateProject(prev => ({
                ...prev,
                tasks: prev.tasks
                    .filter(task => task.id !== taskId)
                    .map(task => ({
                        ...task,
                        dependencies: task.dependencies.filter(depId => depId !== taskId)
                    }))
            }));
        } catch (err) {
            setError(`Erreur lors de la suppression de la tâche: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [project, updateProject]);

    // Réordonner les tâches
    const reorderTasks = useCallback((taskIds: string[]) => {
        if (!project) return;

        try {
            const taskMap = new Map<string, Task>();
            project.tasks.forEach(task => taskMap.set(task.id, task));

            const reorderedTasks = taskIds
                .map(id => taskMap.get(id))
                .filter((task): task is Task => !!task);

            updateProject(prev => ({
                ...prev,
                tasks: reorderedTasks
            }));
        } catch (err) {
            setError(`Erreur lors de la réorganisation des tâches: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, [project, updateProject]);

    // Calculer le chemin critique
// Calculer le chemin critique
    // Calculer le chemin critique
    const calculateCriticalPath = useCallback(() => {
        if (!project || project.tasks.length === 0) {
            setCriticalPath([]);
            return [];
        }

        try {
            // Utiliser import() dynamique au lieu de require()
            return import('../services/algorithm/criticalPath')
                .then(module => {
                    const { calculateCriticalPath: calcPath } = module;
                    const result = calcPath(project.tasks);
                    setCriticalPath(result.criticalPath);
                    return result.criticalPath;
                })
                .catch(error => {
                    console.error('Erreur lors du calcul du chemin critique:', error);
                    setCriticalPath([]);
                    return [];
                });
        } catch (error) {
            console.error('Erreur lors du calcul du chemin critique:', error);
            setCriticalPath([]);
            return [];
        }
    }, [project]);

    // Calculer le chemin critique lors du changement de projet ou de tâches
    useEffect(() => {
        if (project && project.tasks.length > 0) {
            calculateCriticalPath();
        } else {
            setCriticalPath([]);
        }
    }, [project?.id, project?.tasks.length, calculateCriticalPath]);

    // Valeur du contexte
    const contextValue: ProjectContextType = {
        currentProjectId,
        setCurrentProjectId,
        project,
        loading,
        error,
        validationErrors,
        updateProject,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks,
        criticalPath,
        calculateCriticalPath
    };

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte de projet
export const useProjectContext = (): ProjectContextType => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjectContext doit être utilisé à l\'intérieur d\'un ProjectProvider');
    }
    return context;
};