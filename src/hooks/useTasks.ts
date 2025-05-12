/**
 * Hook pour gérer les tâches d'un projet
 * Ce hook fournit des méthodes avancées pour manipuler les tâches
 */

import { useState, useCallback } from 'react';
import { Task } from '../services/localStorage/projectStorage';
import { useProject } from './useProject';
import { addDays, parseISO } from 'date-fns';
import { calculateCriticalPath } from '../services/algorithm/criticalPath';

/**
 * Hook pour gérer les tâches d'un projet
 * @param projectId ID du projet
 * @returns Un objet contenant les tâches, leur analyse et des fonctions pour les manipuler
 */
export function useTasks(projectId: string | null) {
    const { project, updateProject, addTask: addTaskToProject, updateTask: updateTaskInProject, deleteTask: deleteTaskFromProject } = useProject(projectId);
    const [criticalPathTasks, setCriticalPathTasks] = useState<string[]>([]);

    // Obtenir toutes les tâches du projet
    const tasks = project?.tasks || [];

    // Calculer le chemin critique
    const calculateProjectCriticalPath = useCallback(() => {
        if (!project) return [];

        try {
            const { criticalPath } = calculateCriticalPath(tasks);
            setCriticalPathTasks(criticalPath);
            return criticalPath;
        } catch (error) {
            console.error('Erreur lors du calcul du chemin critique:', error);
            return [];
        }
    }, [tasks, project]);

    // Ajouter une tâche
    const addTask = useCallback((taskName: string, duration: number, dependencies: string[] = []) => {
        if (!project) return;

        try {
            // Calculer les dates de début et de fin
            const today = new Date();
            const endDate = addDays(today, duration - 1); // -1 car la durée inclut le jour de début

            const newTask: Omit<Task, 'id'> = {
                name: taskName,
                start: today.toISOString(),
                end: endDate.toISOString(),
                duration,
                progress: 0,
                dependencies,
                resources: [],
                isComplete: false
            };

            addTaskToProject(newTask);

            // Recalculer le chemin critique
            calculateProjectCriticalPath();
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'une tâche:', error);
        }
    }, [project, addTaskToProject, calculateProjectCriticalPath]);

    // Mettre à jour une tâche
    const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
        if (!project) return;

        try {
            updateTaskInProject(taskId, updates);

            // Recalculer le chemin critique si nécessaire
            if (updates.duration || updates.dependencies || updates.start || updates.end) {
                calculateProjectCriticalPath();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour d\'une tâche:', error);
        }
    }, [project, updateTaskInProject, calculateProjectCriticalPath]);

    // Supprimer une tâche
    const deleteTask = useCallback((taskId: string) => {
        if (!project) return;

        try {
            deleteTaskFromProject(taskId);

            // Recalculer le chemin critique
            calculateProjectCriticalPath();
        } catch (error) {
            console.error('Erreur lors de la suppression d\'une tâche:', error);
        }
    }, [project, deleteTaskFromProject, calculateProjectCriticalPath]);

    // Mettre à jour la dépendance d'une tâche
    const updateTaskDependency = useCallback((taskId: string, dependencyId: string, add: boolean) => {
        if (!project) return;

        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const newDependencies = add
                ? [...task.dependencies, dependencyId]
                : task.dependencies.filter(id => id !== dependencyId);

            updateTaskInProject(taskId, { dependencies: newDependencies });

            // Recalculer le chemin critique
            calculateProjectCriticalPath();
        } catch (error) {
            console.error('Erreur lors de la mise à jour des dépendances:', error);
        }
    }, [project, tasks, updateTaskInProject, calculateProjectCriticalPath]);

    // Mettre à jour la progression d'une tâche
    const updateTaskProgress = useCallback((taskId: string, progress: number) => {
        if (!project) return;

        try {
            const clampedProgress = Math.max(0, Math.min(100, progress));

            updateTaskInProject(taskId, {
                progress: clampedProgress,
                isComplete: clampedProgress === 100
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la progression:', error);
        }
    }, [project, updateTaskInProject]);

    // Mettre à jour la durée et les dates d'une tâche
    const updateTaskDuration = useCallback((taskId: string, duration: number) => {
        if (!project) return;

        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const startDate = typeof task.start === 'string' ? parseISO(task.start) : task.start;
            const endDate = addDays(startDate, duration - 1); // -1 car la durée inclut le jour de début

            updateTaskInProject(taskId, {
                duration,
                end: endDate.toISOString()
            });

            // Recalculer le chemin critique
            calculateProjectCriticalPath();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la durée:', error);
        }
    }, [project, tasks, updateTaskInProject, calculateProjectCriticalPath]);

    // Vérifier si une tâche est sur le chemin critique
    const isTaskCritical = useCallback((taskId: string) => {
        return criticalPathTasks.includes(taskId);
    }, [criticalPathTasks]);

    // Effet initial pour calculer le chemin critique
    useState(() => {
        if (project) {
            calculateProjectCriticalPath();
        }
    });

    return {
        tasks,
        criticalPathTasks,
        isTaskCritical,
        addTask,
        updateTask,
        deleteTask,
        updateTaskDependency,
        updateTaskProgress,
        updateTaskDuration,
        calculateCriticalPath: calculateProjectCriticalPath
    };
}