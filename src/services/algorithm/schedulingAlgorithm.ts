/**
 * Service pour les algorithmes d'ordonnancement
 * Ce service fournit des méthodes pour calculer des dates optimales pour les tâches
 */

import { Task, Project } from '../localStorage/projectStorage';
import { addDays, differenceInDays, parseISO } from 'date-fns';
import { calculateCriticalPath } from './criticalPath';

/**
 * Interface pour une ressource
 */
export interface Resource {
    id: string;
    name: string;
    availableFrom?: Date;
    availableTo?: Date;
    maxTasks?: number; // Maximum de tâches simultanées
}

/**
 * Interface pour une allocation de ressource
 */
export interface ResourceAllocation {
    taskId: string;
    resourceId: string;
    startDate: Date;
    endDate: Date;
}

/**
 * Planifier un projet en respectant les contraintes de ressources
 * @param project Le projet à planifier
 * @param resources Les ressources disponibles
 * @returns Le projet mis à jour avec de nouvelles dates de tâches
 */
export const scheduleProject = (
    project: Project,
    resources: Resource[] = []
): {
    updatedProject: Project;
    allocations: ResourceAllocation[];
} => {
    // Copie du projet pour ne pas modifier l'original
    const updatedProject: Project = JSON.parse(JSON.stringify(project));

    // Si aucune ressource n'est spécifiée, on planifie uniquement selon les dépendances
    if (resources.length === 0) {
        return {
            updatedProject: scheduleByDependencies(updatedProject),
            allocations: []
        };
    }

    // Sinon, on planifie en tenant compte des ressources
    return scheduleWithResources(updatedProject, resources);
};

/**
 * Planifier un projet uniquement selon les dépendances
 * @param project Le projet à planifier
 * @returns Le projet mis à jour
 */
const scheduleByDependencies = (project: Project): Project => {
    const tasks = [...project.tasks];

    // Calculer le chemin critique
    const { taskValues } = calculateCriticalPath(tasks);

    // Mettre à jour les dates des tâches
    tasks.forEach(task => {
        const taskValue = taskValues.find(tv => tv.id === task.id);
        if (!taskValue) return;

        // Mettre à jour la date de début (ES)
        const today = new Date();
        const startDate = addDays(today, taskValue.es);
        const endDate = addDays(today, taskValue.ef - 1); // -1 car EF est le jour après la fin

        task.start = startDate.toISOString();
        task.end = endDate.toISOString();
    });

    return {
        ...project,
        tasks,
        updatedAt: new Date().toISOString()
    };
};

/**
 * Planifier un projet en tenant compte des ressources
 * @param project Le projet à planifier
 * @param resources Les ressources disponibles
 * @returns Le projet mis à jour et les allocations de ressources
 */
const scheduleWithResources = (
    project: Project,
    resources: Resource[]
): {
    updatedProject: Project;
    allocations: ResourceAllocation[];
} => {
    const tasks = [...project.tasks];
    const allocations: ResourceAllocation[] = [];

    // Créer une carte des tâches pour un accès facile
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Créer un graphe de dépendances
    const graph = new Map<string, string[]>();
    tasks.forEach(task => {
        if (!graph.has(task.id)) {
            graph.set(task.id, []);
        }

        task.dependencies.forEach(depId => {
            if (!graph.has(depId)) {
                graph.set(depId, []);
            }
            graph.get(depId)!.push(task.id);
        });
    });

    // Calculer les degrés d'entrée pour chaque tâche
    const inDegree = new Map<string, number>();
    tasks.forEach(task => {
        inDegree.set(task.id, task.dependencies.length);
    });

    // File d'attente pour le tri topologique
    const queue = tasks
        .filter(task => task.dependencies.length === 0)
        .map(task => task.id);

    // Disponibilité des ressources
    const resourceAvailability = new Map<string, Date>();
    resources.forEach(resource => {
        resourceAvailability.set(resource.id, resource.availableFrom || new Date());
    });

    // Traiter les tâches dans l'ordre topologique
    const processedTasks = new Set<string>();

    while (queue.length > 0) {
        const taskId = queue.shift()!;
        const task = taskMap.get(taskId)!;
        processedTasks.add(taskId);

        // Déterminer la date de début au plus tôt (basée sur les dépendances)
        let earliestStart = new Date();

        // Si la tâche a des dépendances, calculer la date de début au plus tôt
        if (task.dependencies.length > 0) {
            task.dependencies.forEach(depId => {
                const depTask = taskMap.get(depId);
                if (!depTask) return;

                const depEndDate = typeof depTask.end === 'string'
                    ? parseISO(depTask.end)
                    : depTask.end;

                if (depEndDate > earliestStart) {
                    earliestStart = new Date(depEndDate);
                    // Ajouter un jour car la tâche ne peut commencer qu'après la fin de sa dépendance
                    earliestStart.setDate(earliestStart.getDate() + 1);
                }
            });
        }

        // Si la tâche a des ressources assignées
        if (task.resources && task.resources.length > 0) {
            let latestResourceAvailability = earliestStart;

            // Trouver la ressource qui sera disponible le plus tard
            task.resources.forEach(resourceId => {
                const resourceDate = resourceAvailability.get(resourceId);
                if (resourceDate && resourceDate > latestResourceAvailability) {
                    latestResourceAvailability = new Date(resourceDate);
                }
            });

            // Mettre à jour la date de début si nécessaire
            if (latestResourceAvailability > earliestStart) {
                earliestStart = latestResourceAvailability;
            }

            // Calculer la durée de la tâche
            const duration = task.duration || 1;

            // Calculer la date de fin
            const endDate = new Date(earliestStart);
            endDate.setDate(endDate.getDate() + duration - 1); // -1 car la durée inclut le jour de début

            // Mettre à jour les dates de la tâche
            task.start = earliestStart.toISOString();
            task.end = endDate.toISOString();

            // Mettre à jour la disponibilité des ressources
            task.resources.forEach(resourceId => {
                const nextAvailable = new Date(endDate);
                nextAvailable.setDate(nextAvailable.getDate() + 1); // Disponible le jour suivant
                resourceAvailability.set(resourceId, nextAvailable);

                // Ajouter l'allocation de ressource
                allocations.push({
                    taskId: task.id,
                    resourceId,
                    startDate: new Date(earliestStart),
                    endDate: new Date(endDate)
                });
            });
        } else {
            // Si aucune ressource n'est assignée, utiliser simplement la date au plus tôt
            const duration = task.duration || 1;
            const endDate = new Date(earliestStart);
            endDate.setDate(endDate.getDate() + duration - 1);

            task.start = earliestStart.toISOString();
            task.end = endDate.toISOString();
        }

        // Mettre à jour le graphe et ajouter les successeurs à la file d'attente
        const successors = graph.get(taskId) || [];
        successors.forEach(succId => {
            inDegree.set(succId, inDegree.get(succId)! - 1);
            if (inDegree.get(succId) === 0) {
                queue.push(succId);
            }
        });
    }

    // Vérifier si toutes les tâches ont été traitées (détection de cycles)
    if (processedTasks.size !== tasks.length) {
        console.warn('Certaines tâches n\'ont pas été planifiées, il y a peut-être des dépendances circulaires.');
    }

    return {
        updatedProject: {
            ...project,
            tasks,
            updatedAt: new Date().toISOString()
        },
        allocations
    };
};

/**
 * Calculer les dates de début au plus tard pour répondre à une deadline
 * @param project Le projet à planifier
 * @param deadline La date limite du projet
 * @returns Le projet mis à jour avec de nouvelles dates de tâches
 */
export const scheduleFromDeadline = (
    project: Project,
    deadline: Date
): Project => {
    const tasks = [...project.tasks];

    // Calculer le chemin critique pour connaître la durée totale
    const { taskValues, projectDuration } = calculateCriticalPath(tasks);

    // Calculer la date de début du projet pour respecter la deadline
    const projectStartDate = new Date(deadline);
    projectStartDate.setDate(projectStartDate.getDate() - projectDuration + 1); // +1 car le jour de fin est inclus

    // Mettre à jour les dates des tâches
    tasks.forEach(task => {
        const taskValue = taskValues.find(tv => tv.id === task.id);
        if (!taskValue) return;

        // Calculer les dates en fonction du LST (Latest Start Time)
        const startDate = new Date(projectStartDate);
        startDate.setDate(startDate.getDate() + taskValue.ls);

        const endDate = new Date(projectStartDate);
        endDate.setDate(endDate.getDate() + taskValue.lf - 1); // -1 car LF est le jour après la fin

        task.start = startDate.toISOString();
        task.end = endDate.toISOString();
    });

    return {
        ...project,
        tasks,
        updatedAt: new Date().toISOString()
    };
};

/**
 * Niveler les ressources pour éviter la surallocation
 * @param project Le projet à niveler
 * @param resources Les ressources disponibles
 * @returns Le projet mis à jour avec des dates optimisées
 */
export const levelResources = (
    project: Project,
    resources: Resource[]
): {
    updatedProject: Project;
    allocations: ResourceAllocation[];
} => {
    // D'abord, planifier normalement
    const { updatedProject, allocations: initialAllocations } = scheduleWithResources(project, resources);

    // Identifier les surallocations de ressources
    const resourceTimeline = new Map<string, Map<string, number>>();

    // Initialiser le timeline des ressources
    resources.forEach(resource => {
        resourceTimeline.set(resource.id, new Map<string, number>());
    });

    // Compter l'utilisation des ressources jour par jour
    initialAllocations.forEach(allocation => {
        const resourceId = allocation.resourceId;
        const timeline = resourceTimeline.get(resourceId);
        if (!timeline) return;

        const startDate = allocation.startDate;
        const endDate = allocation.endDate;

        // Pour chaque jour entre la date de début et de fin
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
            timeline.set(dateKey, (timeline.get(dateKey) || 0) + 1);
        }
    });

    // Trouver les ressources surallouées
    const overallocatedDays = new Map<string, string[]>();

    resources.forEach(resource => {
        const maxTasks = resource.maxTasks || 1;
        const timeline = resourceTimeline.get(resource.id);
        if (!timeline) return;

        const overallocated: string[] = [];
        timeline.forEach((count, day) => {
            if (count > maxTasks) {
                overallocated.push(day);
            }
        });

        if (overallocated.length > 0) {
            overallocatedDays.set(resource.id, overallocated);
        }
    });

    // Si aucune surallocation, retourner le résultat initial
    if (overallocatedDays.size === 0) {
        return { updatedProject, allocations: initialAllocations };
    }

    // Sinon, essayer de réorganiser les tâches non critiques
    const tasks = [...updatedProject.tasks];
    const { taskValues } = calculateCriticalPath(tasks);
    const taskMap = new Map<string, Task>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Trier les allocations par priorité (les tâches critiques en premier)
    const sortedAllocations = [...initialAllocations].sort((a, b) => {
        const taskA = taskMap.get(a.taskId);
        const taskB = taskMap.get(b.taskId);
        if (!taskA || !taskB) return 0;

        const valueA = taskValues.find(tv => tv.id === a.taskId);
        const valueB = taskValues.find(tv => tv.id === b.taskId);

        // Les tâches critiques ont la priorité
        if (valueA?.isCritical && !valueB?.isCritical) return -1;
        if (!valueA?.isCritical && valueB?.isCritical) return 1;

        // Ensuite, trier par slack (marge)
        const slackA = valueA?.slack || 0;
        const slackB = valueB?.slack || 0;
        return slackA - slackB;
    });

    // Réallouer les ressources en commençant par les tâches prioritaires
    const finalAllocations: ResourceAllocation[] = [];
    const updatedResourceTimeline = new Map<string, Map<string, number>>();

    // Initialiser le timeline des ressources
    resources.forEach(resource => {
        updatedResourceTimeline.set(resource.id, new Map<string, number>());
    });

    // Fonction pour vérifier si une période est disponible pour une ressource
    const isPeriodAvailable = (
        resourceId: string,
        startDate: Date,
        endDate: Date,
        maxTasks: number
    ): boolean => {
        const timeline = updatedResourceTimeline.get(resourceId);
        if (!timeline) return false;

        // Vérifier chaque jour de la période
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0];
            if ((timeline.get(dateKey) || 0) >= maxTasks) {
                return false;
            }
        }

        return true;
    };

    // Fonction pour marquer une période comme utilisée
    const markPeriodUsed = (
        resourceId: string,
        startDate: Date,
        endDate: Date
    ): void => {
        const timeline = updatedResourceTimeline.get(resourceId);
        if (!timeline) return;

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = date.toISOString().split('T')[0];
            timeline.set(dateKey, (timeline.get(dateKey) || 0) + 1);
        }
    };

    // Réallouer les tâches
    sortedAllocations.forEach(allocation => {
        const task = taskMap.get(allocation.taskId);
        if (!task) {
            finalAllocations.push(allocation);
            return;
        }

        const resource = resources.find(r => r.id === allocation.resourceId);
        if (!resource) {
            finalAllocations.push(allocation);
            return;
        }

        const maxTasks = resource.maxTasks || 1;
        const taskValue = taskValues.find(tv => tv.id === task.id);

        // Si c'est une tâche critique ou sans marge, garder l'allocation originale
        if (taskValue?.isCritical || taskValue?.slack === 0) {
            finalAllocations.push(allocation);
            markPeriodUsed(allocation.resourceId, allocation.startDate, allocation.endDate);
            return;
        }

        // Sinon, essayer de décaler la tâche dans sa marge disponible
        let found = false;
        const duration = differenceInDays(allocation.endDate, allocation.startDate) + 1;

        // Calculer les limites de la fenêtre de déplacement
        const es = taskValue?.es || 0;
        const ls = taskValue?.ls || 0;
        const slack = ls - es;

        if (slack > 0) {
            const baseDate = new Date();

            // Essayer chaque jour possible dans la marge
            for (let offset = 0; offset <= slack; offset++) {
                const potentialStart = addDays(baseDate, es + offset);
                const potentialEnd = addDays(potentialStart, duration - 1);

                if (isPeriodAvailable(allocation.resourceId, potentialStart, potentialEnd, maxTasks)) {
                    // Cette période est disponible, l'utiliser
                    const newAllocation: ResourceAllocation = {
                        ...allocation,
                        startDate: potentialStart,
                        endDate: potentialEnd
                    };

                    finalAllocations.push(newAllocation);
                    markPeriodUsed(allocation.resourceId, potentialStart, potentialEnd);

                    // Mettre à jour les dates de la tâche
                    task.start = potentialStart.toISOString();
                    task.end = potentialEnd.toISOString();

                    found = true;
                    break;
                }
            }
        }

        // Si aucune période n'est disponible, utiliser l'allocation originale
        if (!found) {
            finalAllocations.push(allocation);
            markPeriodUsed(allocation.resourceId, allocation.startDate, allocation.endDate);
        }
    });

    return {
        updatedProject: {
            ...updatedProject,
            tasks,
            updatedAt: new Date().toISOString()
        },
        allocations: finalAllocations
    };
};