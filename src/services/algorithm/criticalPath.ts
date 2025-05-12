/**
 * Service pour calculer le chemin critique dans les diagrammes Gantt et PERT
 */

import { Task } from '../localStorage/projectStorage';
import { differenceInDays, parseISO } from 'date-fns';

// Interface pour stocker les valeurs forward/backward pass
interface TaskValues {
    id: string;
    es: number; // Earliest Start
    ef: number; // Earliest Finish
    ls: number; // Latest Start
    lf: number; // Latest Finish
    slack: number;
    isCritical: boolean;
}

/**
 * Calculer le chemin critique pour les tâches d'un projet
 * @param tasks Liste des tâches
 * @returns Un objet contenant le chemin critique et des informations supplémentaires
 */
export const calculateCriticalPath = (tasks: Task[]): {
    criticalPath: string[];
    taskValues: TaskValues[];
    projectDuration: number;
} => {
    // Créer une copie des tâches pour les manipuler
    const tasksCopy = [...tasks];

    // S'assurer que toutes les tâches ont une durée
    tasksCopy.forEach(task => {
        if (!task.duration) {
            // Calculer la durée si elle n'est pas définie
            const start = typeof task.start === 'string' ? parseISO(task.start) : task.start;
            const end = typeof task.end === 'string' ? parseISO(task.end) : task.end;
            task.duration = differenceInDays(end, start) + 1;
        }
    });

    // Créer un mapping des tâches pour un accès facile
    const taskMap = new Map<string, Task>();
    tasksCopy.forEach(task => taskMap.set(task.id, task));

    // Identifier les tâches de départ (sans dépendances)
    const startTasks = tasksCopy.filter(task => task.dependencies.length === 0);

    // Initialiser les valeurs de chaque tâche
    const taskValues = new Map<string, TaskValues>();
    tasksCopy.forEach(task => {
        taskValues.set(task.id, {
            id: task.id,
            es: 0,
            ef: 0,
            ls: 0,
            lf: 0,
            slack: 0,
            isCritical: false
        });
    });

    // Forward pass (calculer les dates au plus tôt)
    forwardPass(tasksCopy, taskValues, taskMap);

    // Trouver la durée du projet (dernier EF)
    let projectDuration = 0;
    taskValues.forEach(value => {
        if (value.ef > projectDuration) {
            projectDuration = value.ef;
        }
    });

    // Backward pass (calculer les dates au plus tard)
    backwardPass(tasksCopy, taskValues, taskMap, projectDuration);

    // Calculer la marge et identifier les tâches critiques
    const criticalTasks: string[] = [];
    taskValues.forEach((value, taskId) => {
        // Calculer la marge (slack)
        value.slack = value.ls - value.es;

        // Si la marge est nulle, la tâche est critique
        if (value.slack === 0) {
            value.isCritical = true;
            criticalTasks.push(taskId);
        }
    });

    // Trier les tâches critiques pour former le chemin critique
    const criticalPath = sortCriticalTasks(criticalTasks, taskMap);

    // Convertir la Map en array pour le retour
    const taskValuesArray = Array.from(taskValues.values());

    return {
        criticalPath,
        taskValues: taskValuesArray,
        projectDuration
    };
};

/**
 * Forward pass (calculer ES et EF)
 */
const forwardPass = (
    tasks: Task[],
    taskValues: Map<string, TaskValues>,
    taskMap: Map<string, Task>
): void => {
    // Créer un graphe orienté pour représenter les dépendances
    const graph = new Map<string, string[]>();
    tasks.forEach(task => {
        // Pour chaque tâche, enregistrer ses successeurs
        task.dependencies.forEach(depId => {
            if (!graph.has(depId)) {
                graph.set(depId, []);
            }
            graph.get(depId)!.push(task.id);
        });

        // S'assurer que chaque tâche a une entrée dans le graphe
        if (!graph.has(task.id)) {
            graph.set(task.id, []);
        }
    });

    // Calculer les degrés d'entrée pour chaque tâche
    const inDegree = new Map<string, number>();
    tasks.forEach(task => {
        inDegree.set(task.id, task.dependencies.length);
    });

    // File d'attente pour le tri topologique
    const queue: string[] = [];

    // Commencer par les tâches sans dépendances
    tasks.forEach(task => {
        if (task.dependencies.length === 0) {
            queue.push(task.id);
            const value = taskValues.get(task.id)!;
            value.es = 0;
            value.ef = task.duration;
        }
    });

    // Traiter les tâches dans l'ordre topologique
    while (queue.length > 0) {
        const taskId = queue.shift()!;
        const successors = graph.get(taskId) || [];

        // Mettre à jour ES et EF pour chaque successeur
        for (const succId of successors) {
            const succTask = taskMap.get(succId)!;
            const succValue = taskValues.get(succId)!;
            const currentValue = taskValues.get(taskId)!;

            // ES est le maximum de EF de tous les prédécesseurs
            if (currentValue.ef > succValue.es) {
                succValue.es = currentValue.ef;
                succValue.ef = succValue.es + succTask.duration;
            }

            // Réduire le degré d'entrée et ajouter à la queue si tous les prédécesseurs ont été traités
            inDegree.set(succId, inDegree.get(succId)! - 1);
            if (inDegree.get(succId) === 0) {
                queue.push(succId);
            }
        }
    }
};

/**
 * Backward pass (calculer LS et LF)
 */
const backwardPass = (
    tasks: Task[],
    taskValues: Map<string, TaskValues>,
    taskMap: Map<string, Task>,
    projectDuration: number
): void => {
    // Créer un graphe inversé
    const reverseGraph = new Map<string, string[]>();
    tasks.forEach(task => {
        // Pour chaque tâche, enregistrer ses prédécesseurs
        task.dependencies.forEach(depId => {
            if (!reverseGraph.has(task.id)) {
                reverseGraph.set(task.id, []);
            }
            reverseGraph.get(task.id)!.push(depId);
        });

        // S'assurer que chaque tâche a une entrée dans le graphe inversé
        if (!reverseGraph.has(task.id)) {
            reverseGraph.set(task.id, []);
        }
    });

    // Trouver les tâches terminales (celles qui n'ont pas de successeurs)
    const terminalTasks = tasks.filter(task => {
        return !tasks.some(t => t.dependencies.includes(task.id));
    });

    // Initialiser LS et LF pour les tâches terminales
    terminalTasks.forEach(task => {
        const value = taskValues.get(task.id)!;
        value.lf = projectDuration;
        value.ls = value.lf - task.duration;
    });

    // Calculer les degrés de sortie pour chaque tâche
    const outDegree = new Map<string, number>();
    tasks.forEach(task => {
        outDegree.set(task.id, 0);
    });

    tasks.forEach(task => {
        task.dependencies.forEach(depId => {
            outDegree.set(depId, (outDegree.get(depId) || 0) + 1);
        });
    });

    // File d'attente pour le tri topologique inversé
    const queue = terminalTasks.map(task => task.id);

    // Traiter les tâches dans l'ordre topologique inversé
    while (queue.length > 0) {
        const taskId = queue.shift()!;
        const predecessors = reverseGraph.get(taskId) || [];

        // Mettre à jour LS et LF pour chaque prédécesseur
        for (const predId of predecessors) {
            const predTask = taskMap.get(predId)!;
            const predValue = taskValues.get(predId)!;
            const currentValue = taskValues.get(taskId)!;

            // LF est le minimum de LS de tous les successeurs
            if (predValue.lf === 0 || currentValue.ls < predValue.lf) {
                predValue.lf = currentValue.ls;
                predValue.ls = predValue.lf - predTask.duration;
            }

            // Réduire le degré de sortie et ajouter à la queue si tous les successeurs ont été traités
            outDegree.set(predId, outDegree.get(predId)! - 1);
            if (outDegree.get(predId) === 0) {
                queue.push(predId);
            }
        }
    }
};

/**
 * Trier les tâches critiques pour former le chemin critique
 */
const sortCriticalTasks = (
    criticalTasks: string[],
    taskMap: Map<string, Task>
): string[] => {
    // Si aucune tâche critique, retourner un tableau vide
    if (criticalTasks.length === 0) {
        return [];
    }

    // Créer un graphe des tâches critiques
    const criticalGraph = new Map<string, string[]>();
    criticalTasks.forEach(taskId => {
        criticalGraph.set(taskId, []);
    });

    // Remplir le graphe avec les dépendances entre tâches critiques
    criticalTasks.forEach(taskId => {
        const task = taskMap.get(taskId);
        if (!task) return;

        task.dependencies
            .filter(depId => criticalTasks.includes(depId))
            .forEach(depId => {
                if (!criticalGraph.has(depId)) {
                    criticalGraph.set(depId, []);
                }
                criticalGraph.get(depId)!.push(taskId);
            });
    });

    // Trouver les tâches de départ (sans dépendances ou dont les dépendances ne sont pas critiques)
    const startNodes = criticalTasks.filter(taskId => {
        const task = taskMap.get(taskId);
        if (!task) return false;

        return task.dependencies.length === 0 ||
            !task.dependencies.some(depId => criticalTasks.includes(depId));
    });

    // Tri topologique pour ordonner le chemin critique
    const orderedPath: string[] = [];
    const visited = new Set<string>();

    // Fonction DFS pour parcourir le graphe
    const dfs = (taskId: string): void => {
        if (visited.has(taskId)) return;
        visited.add(taskId);

        const successors = criticalGraph.get(taskId) || [];
        for (const succId of successors) {
            dfs(succId);
        }

        orderedPath.unshift(taskId);
    };

    // Parcourir à partir de chaque nœud de départ
    startNodes.forEach(startNode => {
        dfs(startNode);
    });

    return orderedPath;
};