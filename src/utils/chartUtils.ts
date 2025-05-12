/**
 * Utilitaires pour les diagrammes
 * Ce fichier contient des fonctions utilitaires pour les diagrammes Gantt et PERT
 */

import { Task } from '../models/Task';
import { calculateDuration } from './dateUtils';

/**
 * Générer une couleur aléatoire pour une tâche
 * @returns Une chaîne de couleur hexadécimale
 */
export const generateRandomColor = (): string => {
    const colors = [
        '#000000', // Noir
        '#1f2937', // Gris foncé
        '#374151', // Gris plus foncé
        '#4b5563', // Gris moyen
        '#6b7280', // Gris plus clair
        '#9ca3af', // Gris clair
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Vérifier si une tâche a des dépendances circulaires
 * @param taskId ID de la tâche à vérifier
 * @param dependencies Liste des dépendances à ajouter
 * @param tasks Toutes les tâches du projet
 * @returns Booléen indiquant si une dépendance circulaire a été détectée
 */
export const hasCircularDependency = (
    taskId: string,
    dependencies: string[],
    tasks: Task[]
): boolean => {
    // Créer un graphe de dépendances
    const graph = new Map<string, string[]>();

    // Remplir le graphe avec les dépendances existantes
    tasks.forEach(task => {
        graph.set(task.id, [...task.dependencies]);
    });

    // Ajouter les nouvelles dépendances
    graph.set(taskId, [...dependencies]);

    // Fonction DFS pour détecter les cycles
    const hasCycle = (node: string, visited: Set<string>, recursionStack: Set<string>): boolean => {
        // Marquer le nœud comme visité et l'ajouter à la pile de récursion
        visited.add(node);
        recursionStack.add(node);

        // Visiter tous les voisins
        const neighbors = graph.get(node) || [];
        for (const neighbor of neighbors) {
            // Si le voisin n'a pas été visité, continuer la recherche
            if (!visited.has(neighbor)) {
                if (hasCycle(neighbor, visited, recursionStack)) {
                    return true;
                }
            }
            // Si le voisin est dans la pile de récursion, un cycle est détecté
            else if (recursionStack.has(neighbor)) {
                return true;
            }
        }

        // Retirer le nœud de la pile de récursion
        recursionStack.delete(node);
        return false;
    };

    // Vérifier les cycles pour chaque nœud
    const visited = new Set<string>();
    for (const task of tasks) {
        if (!visited.has(task.id)) {
            if (hasCycle(task.id, visited, new Set<string>())) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Générer un ID unique pour une nouvelle tâche
 * @param prefix Préfixe pour l'ID (par défaut 'task')
 * @returns ID unique basé sur un timestamp
 */
export const generateTaskId = (prefix: string = 'task'): string => {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Calculer le pourcentage de progression d'un projet
 * @param tasks Liste des tâches du projet
 * @returns Pourcentage de progression (0-100)
 */
export const calculateProjectProgress = (tasks: Task[]): number => {
    if (tasks.length === 0) return 0;

    // Calculer la durée totale et la progression pondérée
    let totalDuration = 0;
    let weightedProgress = 0;

    tasks.forEach(task => {
        const duration = task.duration || calculateDuration(task.start, task.end);
        totalDuration += duration;
        weightedProgress += duration * (task.progress / 100);
    });

    if (totalDuration === 0) return 0;
    return Math.round((weightedProgress / totalDuration) * 100);
};

/**
 * Trier les tâches selon un ordre spécifique
 * @param tasks Liste des tâches à trier
 * @param sortBy Critère de tri ('start', 'end', 'duration', 'name', 'progress')
 * @param ascending Ordre ascendant ou descendant
 * @returns Liste des tâches triées
 */
export const sortTasks = (
    tasks: Task[],
    sortBy: 'start' | 'end' | 'duration' | 'name' | 'progress' = 'start',
    ascending: boolean = true
): Task[] => {
    const sortedTasks = [...tasks];

    sortedTasks.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
            case 'start':
                const startA = typeof a.start === 'string' ? new Date(a.start) : a.start;
                const startB = typeof b.start === 'string' ? new Date(b.start) : b.start;
                comparison = startA.getTime() - startB.getTime();
                break;

            case 'end':
                const endA = typeof a.end === 'string' ? new Date(a.end) : a.end;
                const endB = typeof b.end === 'string' ? new Date(b.end) : b.end;
                comparison = endA.getTime() - endB.getTime();
                break;

            case 'duration':
                const durationA = a.duration || calculateDuration(a.start, a.end);
                const durationB = b.duration || calculateDuration(b.start, b.end);
                comparison = durationA - durationB;
                break;

            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;

            case 'progress':
                comparison = a.progress - b.progress;
                break;
        }

        return ascending ? comparison : -comparison;
    });

    return sortedTasks;
};

/**
 * Formater une valeur numérique pour l'affichage
 * @param value Valeur à formater
 * @param decimalPlaces Nombre de décimales
 * @returns Chaîne formatée
 */
export const formatNumber = (
    value: number,
    decimalPlaces: number = 0
): string => {
    return value.toFixed(decimalPlaces);
};