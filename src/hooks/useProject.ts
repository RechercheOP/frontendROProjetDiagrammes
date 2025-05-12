/**
 * Hook pour gérer les projets
 * Ce hook utilise le service de stockage des projets pour fournir une interface conviviale
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Project,
    Task,
    saveProject,
    getProject,
    getAllProjects,
    deleteProject,
    createProject as createProjectService
} from '../services/localStorage/projectStorage';
import { validateGanttProject } from '../services/chart/ganttService';
import { validatePertProject } from '../services/chart/pertService';

/**
 * Hook pour gérer un projet spécifique
 * @param projectId ID du projet à gérer
 * @returns Un objet contenant le projet, les fonctions pour le manipuler et le statut
 */
export function useProject(projectId: string | null) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Charger le projet
    useEffect(() => {
        if (!projectId) {
            setProject(null);
            setLoading(false);
            return;
        }

        try {
            const fetchedProject = getProject(projectId);
            setProject(fetchedProject);

            // Valider le projet
            if (fetchedProject) {
                const errors = fetchedProject.type === 'gantt'
                    ? validateGanttProject(fetchedProject)
                    : validatePertProject(fetchedProject);

                setValidationErrors(errors);
            }
        } catch (err) {
            setError(`Erreur lors du chargement du projet: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Mettre à jour le projet
    const updateProject = useCallback((updatedProject: Project | ((prev: Project) => Project)) => {
        if (!project) return;

        try {
            const newProject = updatedProject instanceof Function ? updatedProject(project) : updatedProject;

            // Mettre à jour la date de modification
            newProject.updatedAt = new Date().toISOString();

            // Sauvegarder le projet
            saveProject(newProject);

            // Mettre à jour l'état local
            setProject(newProject);

            // Valider le projet mis à jour
            const errors = newProject.type === 'gantt'
                ? validateGanttProject(newProject)
                : validatePertProject(newProject);

            setValidationErrors(errors);
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
                id: `task_${Date.now()}`
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

    return {
        project,
        loading,
        error,
        validationErrors,
        updateProject,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks
    };
}

/**
 * Hook pour gérer tous les projets
 * @returns Un objet contenant la liste des projets et les fonctions pour les manipuler
 */
export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Charger tous les projets
    const loadProjects = useCallback(() => {
        try {
            const fetchedProjects = getAllProjects();
            setProjects(fetchedProjects);
        } catch (err) {
            setError(`Erreur lors du chargement des projets: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les projets au montage
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Créer un nouveau projet
    const createProject = useCallback((name: string, description: string = '', type: 'gantt' | 'pert') => {
        try {
            const newProject = createProjectService(name, description, type);
            setProjects(prev => [...prev, newProject]);
            return newProject.id;
        } catch (err) {
            setError(`Erreur lors de la création du projet: ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }, []);

    // Supprimer un projet
    const removeProject = useCallback((projectId: string) => {
        try {
            deleteProject(projectId);
            setProjects(prev => prev.filter(project => project.id !== projectId));
        } catch (err) {
            setError(`Erreur lors de la suppression du projet: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, []);

    return {
        projects,
        loading,
        error,
        loadProjects,
        createProject,
        removeProject
    };
}