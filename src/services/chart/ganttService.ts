/**
 * Service pour gérer les diagrammes Gantt
 * Ce service fournit des méthodes pour manipuler et calculer les données des diagrammes Gantt
 */

import { Task, Project } from '../localStorage/projectStorage';
import { format, addDays, differenceInDays, parseISO, isValid } from 'date-fns';

// Interface pour les tâches adaptée au format requis par gantt-task-react
export interface GanttTask {
    id: string;
    name: string;
    start: Date;
    end: Date;
    progress: number;
    dependencies: string[];
    type: 'task' | 'milestone' | 'project';
    isComplete?: boolean;
    styles?: {
        backgroundColor?: string;
        progressColor?: string;
        backgroundSelectedColor?: string;
    };
    project?: string;
    hideChildren?: boolean;
    displayOrder?: number;
}

// Fonction pour assigner des couleurs différentes aux tâches pour meilleure visualisation
const getColorForTask = (taskIndex: number): string => {
    // Palette de couleurs pour les tâches
    const colors = [
        '#1e40af', // bleu foncé
        '#1d4ed8', // bleu
        '#2563eb', // bleu vif
        '#3b82f6', // bleu clair
        '#0f766e', // teal foncé
        '#0d9488', // teal
        '#14b8a6', // teal clair
        '#0891b2', // cyan
        '#4338ca', // indigo
        '#6366f1', // indigo clair
        '#7c3aed', // violet
        '#8b5cf6', // violet clair
        '#9333ea', // pourpre
        '#d946ef', // pourpre clair
        '#c026d3', // fuschia
        '#db2777', // rose foncé
        '#ec4899', // rose
        '#f43f5e', // rose-rouge
        '#e11d48', // rouge
        '#be123c', // rouge foncé
        '#9f1239', // bordeaux
        '#ea580c', // orange
        '#f97316', // orange clair
        '#eab308', // jaune
    ];

    // Récupérer une couleur basée sur l'index de la tâche
    return colors[taskIndex % colors.length];
};

// Helper to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
    // Convert hex to RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + percent));
    g = Math.max(0, Math.min(255, g + percent));
    b = Math.max(0, Math.min(255, b + percent));

    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Convert Project tasks to format expected by gantt-task-react
// Convert Project tasks to format expected by gantt-task-react
export const convertToGanttTasks = (project: Project): GanttTask[] => {
    // Vérifier d'abord que le projet a des tâches
    if (!project.tasks || project.tasks.length === 0) {
        return [];
    }

    // Copier les tâches pour éviter de modifier l'original
    const tasksCopy = JSON.parse(JSON.stringify(project.tasks)) as Task[];

    // Construire un graph de dépendance
    const taskMap = new Map<string, Task>();
    tasksCopy.forEach(task => taskMap.set(task.id, task));

    // Attribuer une date de début par défaut aux tâches sans dépendances
    // Utilisons la date actuelle comme date de début par défaut
    const today = new Date();

    // Fonction pour obtenir la date de début d'une tâche
    const getTaskStartDate = (taskId: string, visited = new Set<string>()): Date => {
        // Détecter les dépendances circulaires
        if (visited.has(taskId)) {
            console.error("Dépendance circulaire détectée pour la tâche", taskId);
            return today;
        }

        const task = taskMap.get(taskId);
        if (!task) {
            console.error("Tâche non trouvée:", taskId);
            return today;
        }

        // Si la tâche n'a pas de dépendances, utiliser sa date de début ou aujourd'hui
        if (!task.dependencies || task.dependencies.length === 0) {
            return today;
        }

        // Sinon, calculer la date de début en fonction des dépendances
        let latestEndDate = today;

        // Marquer cette tâche comme visitée pour détecter les cycles
        visited.add(taskId);

        for (const depId of task.dependencies) {
            const depTask = taskMap.get(depId);
            if (!depTask) continue;

            // Récursivement obtenir la date de début de la dépendance
            const depStartDate = getTaskStartDate(depId, new Set(visited));

            // Calculer la date de fin de la dépendance
            const depEndDate = new Date(depStartDate);
            depEndDate.setDate(depEndDate.getDate() + (depTask.duration || 1) - 1);

            // Mettre à jour la date de fin la plus tardive
            if (depEndDate > latestEndDate) {
                latestEndDate = new Date(depEndDate);
            }
        }

        // La tâche commence le jour suivant la fin de la dernière dépendance
        const startDate = new Date(latestEndDate);
        startDate.setDate(startDate.getDate() + 1);

        // Mettre à jour la date de début de la tâche
        task.start = startDate;

        // Mettre à jour la date de fin de la tâche
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (task.duration || 1) - 1);
        task.end = endDate;

        return startDate;
    };

    // Calculer les dates pour toutes les tâches
    for (const task of tasksCopy) {
        try {
            // Pour s'assurer que les dates sont bien des objets Date
            const startDate = getTaskStartDate(task.id);
            task.start = startDate;

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + (task.duration || 1) - 1);
            task.end = endDate;
        } catch (error) {
            console.error(`Erreur lors du calcul des dates pour la tâche ${task.id}:`, error);

            // Valeurs par défaut en cas d'erreur
            task.start = new Date();
            const endDefault = new Date();
            endDefault.setDate(endDefault.getDate() + (task.duration || 1) - 1);
            task.end = endDefault;
        }
    }

    // Convertir les tâches au format gantt-task-react
    return tasksCopy.map((task, index) => {
        try {
            // S'assurer que start et end sont des objets Date valides
            let startDate = task.start;
            let endDate = task.end;

            // Convertir les chaînes en objets Date si nécessaire
            if (typeof startDate === 'string') {
                startDate = new Date(startDate);
            }

            if (typeof endDate === 'string') {
                endDate = new Date(endDate);
            }

            // Vérifier si les dates sont valides
            if (!(startDate instanceof Date && !isNaN(startDate.getTime()))) {
                console.warn(`Date de début invalide pour la tâche ${task.id}, utilisation de la date par défaut`);
                startDate = new Date();
            }

            if (!(endDate instanceof Date && !isNaN(endDate.getTime()))) {
                console.warn(`Date de fin invalide pour la tâche ${task.id}, utilisation de la date par défaut`);
                endDate = new Date();
                endDate.setDate(endDate.getDate() + (task.duration || 1) - 1);
            }

            // Utiliser une couleur unique pour chaque tâche
            const taskColor = task.color || getColorForTask(index);

            return {
                id: task.id,
                name: task.name,
                start: startDate,
                end: endDate,
                progress: task.progress / 100, // Convert percentage to decimal
                type: 'task',
                dependencies: task.dependencies,
                displayOrder: index,
                styles: {
                    backgroundColor: taskColor,
                    progressColor: '#ffffff',
                    backgroundSelectedColor: adjustColorBrightness(taskColor, -20)
                }
            };
        } catch (error) {
            console.error(`Erreur lors de la conversion de la tâche ${task.id}:`, error);

            // Renvoyer une tâche par défaut en cas d'erreur
            const defaultStart = new Date();
            const defaultEnd = new Date();
            defaultEnd.setDate(defaultEnd.getDate() + (task.duration || 1) - 1);

            return {
                id: task.id,
                name: task.name || "Tâche sans nom",
                start: defaultStart,
                end: defaultEnd,
                progress: 0,
                type: 'task',
                dependencies: [],
                displayOrder: index,
                styles: {
                    backgroundColor: getColorForTask(index),
                    progressColor: '#ffffff',
                    backgroundSelectedColor: '#000000'
                }
            };
        }
    });
};
// Calculate task duration in days
export const calculateTaskDuration = (start: Date | string, end: Date | string): number => {
    try {
        const startDate = typeof start === 'string' ? parseISO(start) : start;
        const endDate = typeof end === 'string' ? parseISO(end) : end;

        if (!isValid(startDate) || !isValid(endDate)) {
            throw new Error('Invalid date');
        }

        return differenceInDays(endDate, startDate) + 1; // Include both start and end days
    } catch (error) {
        console.error('Error calculating task duration:', error);
        return 1; // Return default duration
    }
};

// Calculate end date based on start date and duration
export const calculateEndDate = (start: Date | string, duration: number): Date => {
    try {
        const startDate = typeof start === 'string' ? parseISO(start) : start;

        if (!isValid(startDate)) {
            throw new Error('Invalid start date');
        }

        return addDays(startDate, duration - 1); // Subtract 1 because duration includes start day
    } catch (error) {
        console.error('Error calculating end date:', error);
        return addDays(new Date(), duration - 1); // Use current date as fallback
    }
};

// Calculate start date based on end date and duration
export const calculateStartDate = (end: Date | string, duration: number): Date => {
    try {
        const endDate = typeof end === 'string' ? parseISO(end) : end;

        if (!isValid(endDate)) {
            throw new Error('Invalid end date');
        }

        return addDays(endDate, -(duration - 1)); // Subtract 1 because duration includes end day
    } catch (error) {
        console.error('Error calculating start date:', error);
        return addDays(new Date(), -(duration - 1)); // Use current date as fallback
    }
};

// Get date range for entire Gantt chart (earliest start to latest end)
export const getGanttDateRange = (tasks: Task[]): { start: Date; end: Date } => {
    if (tasks.length === 0) {
        const today = new Date();
        return { start: today, end: addDays(today, 30) };
    }

    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;

    tasks.forEach(task => {
        try {
            const startDate = typeof task.start === 'string' ? parseISO(task.start) : task.start;
            const endDate = typeof task.end === 'string' ? parseISO(task.end) : task.end;

            if (!isValid(startDate) || !isValid(endDate)) {
                throw new Error('Invalid date');
            }

            if (earliestStart === null || startDate < earliestStart) {
                earliestStart = startDate;
            }

            if (latestEnd === null || endDate > latestEnd) {
                latestEnd = endDate;
            }
        } catch (error) {
            // Skip invalid tasks
            console.error('Error processing task dates:', error);
        }
    });

    // If no valid dates were found, use default range
    if (earliestStart === null || latestEnd === null) {
        const today = new Date();
        return { start: today, end: addDays(today, 30) };
    }

    // Add padding days to start and end for better visualization
    return {
        start: addDays(earliestStart, -2),
        end: addDays(latestEnd, 2)
    };
};

// Check if there are circular dependencies in tasks
export const checkCircularDependencies = (tasks: Task[]): boolean => {
    // Create a map of task id to task for quick lookup
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Helper function to check for cycles using DFS
    const hasCycle = (taskId: string, visited: Set<string>, recursionStack: Set<string>): boolean => {
        // If task is not in recursion stack but was visited before, it's ok
        if (recursionStack.has(taskId)) {
            return true; // Cycle detected
        }

        if (visited.has(taskId)) {
            return false; // Already checked, no cycle
        }

        const task = taskMap.get(taskId);
        if (!task) return false; // Task not found

        // Add to visited and recursion stack
        visited.add(taskId);
        recursionStack.add(taskId);

        // Check all dependencies
        for (const depId of task.dependencies) {
            if (hasCycle(depId, visited, recursionStack)) {
                return true;
            }
        }

        // Remove from recursion stack
        recursionStack.delete(taskId);
        return false;
    };

    // Check each task as a potential starting point
    const visited = new Set<string>();
    for (const task of tasks) {
        if (!visited.has(task.id)) {
            if (hasCycle(task.id, visited, new Set<string>())) {
                return true; // Cycle found
            }
        }
    }

    return false; // No cycles found
};

// Calculate earliest possible start dates for all tasks based on dependencies
export const calculateEarliestStartDates = (tasks: Task[]): Map<string, Date> => {
    const result = new Map<string, Date>();
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Helper function to recursively calculate earliest start date
    const calculateESDate = (taskId: string, visited: Set<string>): Date => {
        // If already calculated, return the result
        if (result.has(taskId)) {
            return result.get(taskId) as Date;
        }

        // Mark as visited to detect cycles
        if (visited.has(taskId)) {
            throw new Error("Circular dependency detected");
        }
        visited.add(taskId);

        const task = taskMap.get(taskId);
        if (!task) {
            throw new Error(`Task with id ${taskId} not found`);
        }

        // If no dependencies, start date is as defined
        if (!task.dependencies || task.dependencies.length === 0) {
            const startDate = typeof task.start === 'string' ? parseISO(task.start) : task.start;
            result.set(taskId, startDate);
            return startDate;
        }

        // Calculate earliest start date based on dependencies
        let earliestStart = null;
        for (const depId of task.dependencies) {
            const depTask = taskMap.get(depId);
            if (!depTask) continue;

            const depEndDate = calculateESDate(depId, new Set([...visited]));
            const depDuration = calculateTaskDuration(depTask.start, depTask.end);
            const dependencyEndDate = addDays(depEndDate, depDuration - 1);

            if (earliestStart === null || dependencyEndDate > earliestStart) {
                // Add one day to end date of dependency to get start date
                earliestStart = addDays(dependencyEndDate, 1);
            }
        }

        // Save and return the result
        result.set(taskId, earliestStart as Date);
        return earliestStart as Date;
    };

    // Calculate earliest start date for each task
    tasks.forEach(task => {
        try {
            calculateESDate(task.id, new Set<string>());
        } catch (error) {
            console.error(`Error calculating earliest start date for task ${task.id}:`, error);
        }
    });

    return result;
};

// Validate Gantt project and tasks
export const validateGanttProject = (project: Project): string[] => {
    const errors: string[] = [];

    // Check project has a name
    if (!project.name || project.name.trim() === '') {
        errors.push('Le projet doit avoir un nom.');
    }

    // Check each task
    project.tasks.forEach((task, index) => {
        // Task must have a name
        if (!task.name || task.name.trim() === '') {
            errors.push(`La tâche à l'index ${index} doit avoir un nom.`);
        }

        // Task must have a valid start and end date
        try {
            const start = typeof task.start === 'string' ? parseISO(task.start) : task.start;
            const end = typeof task.end === 'string' ? parseISO(task.end) : task.end;

            if (!(start instanceof Date) || isNaN(start.getTime())) {
                errors.push(`La date de début de la tâche "${task.name}" est invalide.`);
            }

            if (!(end instanceof Date) || isNaN(end.getTime())) {
                errors.push(`La date de fin de la tâche "${task.name}" est invalide.`);
            }

            // End date must be after or equal to start date
            if (start > end) {
                errors.push(`La date de fin de la tâche "${task.name}" doit être après sa date de début.`);
            }
        } catch (error) {
            errors.push(`Erreur de date pour la tâche "${task.name}": ${error}`);
        }

        // Dependencies must refer to existing tasks
        const taskIds = project.tasks.map(t => t.id);
        task.dependencies.forEach(depId => {
            if (!taskIds.includes(depId)) {
                errors.push(`La tâche "${task.name}" a une dépendance vers une tâche inexistante (ID: ${depId}).`);
            }
        });
    });

    // Check for circular dependencies
    if (checkCircularDependencies(project.tasks)) {
        errors.push('Des dépendances circulaires ont été détectées dans le projet.');
    }

    return errors;
};