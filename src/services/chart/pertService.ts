/**
 * Service pour gérer les diagrammes PERT
 * Ce service fournit des méthodes pour manipuler et calculer les données des diagrammes PERT
 */

import { Task, Project } from '../localStorage/projectStorage';
import { differenceInDays, parseISO } from 'date-fns';

// Interface pour les nœuds PERT
export interface PertNode {
    id: string;
    label: string;
    taskId?: string;  // Si le nœud représente une tâche
    position: { x: number, y: number };
    data?: {
        est?: number; // Earliest Start Time
        lst?: number; // Latest Start Time
        eft?: number; // Earliest Finish Time
        lft?: number; // Latest Finish Time
        slack?: number; // Float
        isCritical?: boolean;
        duration?: number;
    };
    type?: string;
    style?: object;
}

// Interface pour les arêtes PERT
export interface PertEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    style?: object;
}

// Interface pour le graphique PERT complet
export interface PertGraph {
    nodes: PertNode[];
    edges: PertEdge[];
    criticalPath: string[];
}

// Convertir les tâches du projet en graphique PERT
export const convertToPertGraph = (project: Project): PertGraph => {
    // Trier les tâches pour identifier les relations correctement
    const tasks = [...project.tasks].sort((a, b) => {
        // Les tâches sans dépendances viennent en premier
        if (a.dependencies.length === 0 && b.dependencies.length > 0) return -1;
        if (a.dependencies.length > 0 && b.dependencies.length === 0) return 1;

        // Ensuite par date de début
        const startA = typeof a.start === 'string' ? parseISO(a.start) : a.start;
        const startB = typeof b.start === 'string' ? parseISO(b.start) : b.start;
        return startA.getTime() - startB.getTime();
    });

    // Créer un nœud de début et de fin
    const startNodeId = 'start';
    const endNodeId = 'end';

    // Identifier quelles tâches sont de départ (sans dépendances) et de fin (personne ne dépend d'elles)
    const startTasks = tasks.filter(task => task.dependencies.length === 0);

    // Créer les nœuds et calculer les propriétés PERT
    const { nodes, edges } = calculatePertValues(tasks, startNodeId, endNodeId);

    // Calculer le chemin critique
    const criticalPath = calculateCriticalPath(nodes, edges);

    // Marquer les nœuds et arêtes du chemin critique
    markCriticalPath(nodes, edges, criticalPath);

    // Positionner les nœuds dans le graphique
    positionNodes(nodes);

    return { nodes, edges, criticalPath };
};

// Calculer les valeurs PERT (EST, EFT, LST, LFT, Slack)
const calculatePertValues = (tasks: Task[], startNodeId: string, endNodeId: string): { nodes: PertNode[], edges: PertEdge[] } => {
    const nodes: PertNode[] = [];
    const edges: PertEdge[] = [];
    const taskMap = new Map<string, Task>();

    // Créer un mapping des tâches pour un accès facile
    tasks.forEach(task => {
        taskMap.set(task.id, task);
    });

    // Créer les nœuds pour chaque tâche
    tasks.forEach((task, index) => {
        const duration = typeof task.start === 'string' && typeof task.end === 'string'
            ? differenceInDays(parseISO(task.end), parseISO(task.start)) + 1
            : task.duration;

        nodes.push({
            id: task.id,
            label: task.name,
            taskId: task.id,
            position: { x: 0, y: 0 }, // Position temporaire
            data: {
                duration,
                est: 0,          // À calculer
                eft: duration,   // Estimation initiale
                lst: 0,          // À calculer
                lft: duration,   // Estimation initiale
                slack: 0,        // À calculer
                isCritical: false // À déterminer
            },
            type: 'task'
        });
    });

    // Créer les nœuds de début et de fin
    nodes.push({
        id: startNodeId,
        label: 'Début',
        position: { x: 0, y: 0 },
        data: {
            est: 0,
            eft: 0,
            lst: 0,
            lft: 0,
            slack: 0,
            isCritical: true
        },
        type: 'start'
    });

    nodes.push({
        id: endNodeId,
        label: 'Fin',
        position: { x: 0, y: 0 },
        data: {
            est: 0, // À calculer
            eft: 0, // À calculer
            lst: 0, // À calculer
            lft: 0, // À calculer
            slack: 0,
            isCritical: true
        },
        type: 'end'
    });

    // Créer les arêtes entre les nœuds
    tasks.forEach(task => {
        // Si la tâche n'a pas de dépendances, la connecter au nœud de début
        if (task.dependencies.length === 0) {
            edges.push({
                id: `${startNodeId}-${task.id}`,
                source: startNodeId,
                target: task.id,
                label: ''
            });
        } else {
            // Connecter la tâche à ses dépendances
            task.dependencies.forEach(depId => {
                edges.push({
                    id: `${depId}-${task.id}`,
                    source: depId,
                    target: task.id,
                    label: ''
                });
            });
        }

        // Identifier les tâches de fin (qui ne sont pas des dépendances pour d'autres)
        const isEndTask = !tasks.some(t => t.dependencies.includes(task.id));
        if (isEndTask) {
            edges.push({
                id: `${task.id}-${endNodeId}`,
                source: task.id,
                target: endNodeId,
                label: ''
            });
        }
    });

    // Calculer le plus tôt (forward pass)
    calculateEarliestTimes(nodes, edges, startNodeId);

    // Calculer le plus tard (backward pass)
    calculateLatestTimes(nodes, edges, endNodeId);

    // Calculer le slack pour chaque nœud
    calculateSlack(nodes);

    return { nodes, edges };
};

// Calculer les dates au plus tôt (Forward Pass)
const calculateEarliestTimes = (nodes: PertNode[], edges: PertEdge[], startNodeId: string): void => {
    // Créer un mapping des nœuds pour un accès facile
    const nodeMap = new Map<string, PertNode>();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });

    // Créer un graphe orienté pour représenter les dépendances
    const graph = new Map<string, string[]>();
    edges.forEach(edge => {
        if (!graph.has(edge.source)) {
            graph.set(edge.source, []);
        }
        graph.get(edge.source)!.push(edge.target);
    });

    // Calculer les degrés d'entrée pour chaque nœud
    const inDegree = new Map<string, number>();
    nodes.forEach(node => {
        inDegree.set(node.id, 0);
    });
    edges.forEach(edge => {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Réaliser un tri topologique
    const queue: string[] = [startNodeId];
    while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const node = nodeMap.get(nodeId)!;

        // Traiter les successeurs
        const successors = graph.get(nodeId) || [];
        for (const succId of successors) {
            const succNode = nodeMap.get(succId)!;

            // Mettre à jour EST (Earliest Start Time)
            if ((node.data?.eft || 0) > (succNode.data?.est || 0)) {
                if (succNode.data) {
                    succNode.data.est = node.data?.eft || 0;
                    succNode.data.eft = (succNode.data.est || 0) + (succNode.data.duration || 0);
                }
            }

            // Réduire le degré d'entrée et ajouter à la queue si tous les prédécesseurs ont été traités
            inDegree.set(succId, inDegree.get(succId)! - 1);
            if (inDegree.get(succId) === 0) {
                queue.push(succId);
            }
        }
    }
};

// Calculer les dates au plus tard (Backward Pass)
const calculateLatestTimes = (nodes: PertNode[], edges: PertEdge[], endNodeId: string): void => {
    // Créer un mapping des nœuds pour un accès facile
    const nodeMap = new Map<string, PertNode>();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });

    // Créer un graphe inversé
    const reverseGraph = new Map<string, string[]>();
    edges.forEach(edge => {
        if (!reverseGraph.has(edge.target)) {
            reverseGraph.set(edge.target, []);
        }
        reverseGraph.get(edge.target)!.push(edge.source);
    });

    // Initialiser les temps les plus tardifs au temps d'achèvement du projet
    const endNode = nodeMap.get(endNodeId)!;
    const projectCompletionTime = endNode.data?.est || 0;

    nodes.forEach(node => {
        if (node.data) {
            node.data.lft = projectCompletionTime;
            node.data.lst = projectCompletionTime - (node.data.duration || 0);
        }
    });

    // Établir LFT du nœud de fin égal à son EFT
    if (endNode.data) {
        endNode.data.lft = endNode.data.eft || 0;
        endNode.data.lst = endNode.data.est || 0;
    }

    // Calculer les degrés d'entrée pour le graphe inversé
    const outDegree = new Map<string, number>();
    nodes.forEach(node => {
        outDegree.set(node.id, 0);
    });
    edges.forEach(edge => {
        outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    });

    // Réaliser un tri topologique inversé
    const queue: string[] = [endNodeId];
    while (queue.length > 0) {
        const nodeId = queue.shift()!;
        const node = nodeMap.get(nodeId)!;

        // Traiter les prédécesseurs
        const predecessors = reverseGraph.get(nodeId) || [];
        for (const predId of predecessors) {
            const predNode = nodeMap.get(predId)!;

            // Mettre à jour LFT (Latest Finish Time)
            if ((node.data?.lst || 0) < (predNode.data?.lft || Infinity)) {
                if (predNode.data) {
                    predNode.data.lft = node.data?.lst || 0;
                    predNode.data.lst = (predNode.data.lft || 0) - (predNode.data.duration || 0);
                }
            }

            // Réduire le degré de sortie et ajouter à la queue si tous les successeurs ont été traités
            outDegree.set(predId, outDegree.get(predId)! - 1);
            if (outDegree.get(predId) === 0) {
                queue.push(predId);
            }
        }
    }
};

// Calculer la marge (slack) pour chaque nœud
const calculateSlack = (nodes: PertNode[]): void => {
    nodes.forEach(node => {
        if (node.data) {
            node.data.slack = (node.data.lst || 0) - (node.data.est || 0);
        }
    });
};

// Calculer le chemin critique (les nœuds où slack = 0)
const calculateCriticalPath = (nodes: PertNode[], edges: PertEdge[]): string[] => {
    // Identifier les nœuds du chemin critique (slack = 0)
    const criticalNodes = nodes
        .filter(node => (node.data?.slack === 0))
        .map(node => node.id);

    // Construire un graphe des nœuds critiques et leurs connexions
    const criticalGraph = new Map<string, string[]>();
    edges.forEach(edge => {
        if (criticalNodes.includes(edge.source) && criticalNodes.includes(edge.target)) {
            if (!criticalGraph.has(edge.source)) {
                criticalGraph.set(edge.source, []);
            }
            criticalGraph.get(edge.source)!.push(edge.target);
        }
    });

    // Trouver le nœud de début (généralement 'start')
    const startNode = nodes.find(node => node.type === 'start')?.id || criticalNodes[0];

    // Parcourir le graphe pour construire le chemin critique
    const criticalPath: string[] = [startNode];
    let current = startNode;

    while (criticalGraph.has(current) && criticalGraph.get(current)!.length > 0) {
        current = criticalGraph.get(current)![0];
        criticalPath.push(current);
    }

    return criticalPath;
};

// Marquer les nœuds et les arêtes du chemin critique
const markCriticalPath = (nodes: PertNode[], edges: PertEdge[], criticalPath: string[]): void => {
    // Marquer les nœuds
    nodes.forEach(node => {
        if (criticalPath.includes(node.id) && node.data) {
            node.data.isCritical = true;
        }
    });

    // Marquer les arêtes
    edges.forEach(edge => {
        if (criticalPath.includes(edge.source) && criticalPath.includes(edge.target)) {
            edge.animated = true;
            edge.style = { stroke: '#ff4d4f', strokeWidth: 2 };
        }
    });
};

// Positionner les nœuds dans le graphique (algorithme simplifié de mise en page par niveaux)
const positionNodes = (nodes: PertNode[]): void => {
    // Créer un mapping des nœuds pour un accès facile
    const nodeMap = new Map<string, PertNode>();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
    });

    // Regrouper les nœuds par niveau (basé sur EST)
    const levels = new Map<number, PertNode[]>();
    nodes.forEach(node => {
        const level = node.data?.est || 0;
        if (!levels.has(level)) {
            levels.set(level, []);
        }
        levels.get(level)!.push(node);
    });

    // Trier les niveaux
    const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b);

    // Position horizontale basée sur le niveau
    const horizontalSpacing = 250;
    sortedLevels.forEach((level, levelIndex) => {
        const nodesInLevel = levels.get(level) || [];

        // Position verticale basée sur le nombre de nœuds dans le niveau
        const verticalSpacing = 150;
        const levelHeight = nodesInLevel.length * verticalSpacing;
        const startY = -levelHeight / 2;

        nodesInLevel.forEach((node, nodeIndex) => {
            node.position = {
                x: levelIndex * horizontalSpacing,
                y: startY + nodeIndex * verticalSpacing
            };
        });
    });
};

// Valider un projet PERT
export const validatePertProject = (project: Project): string[] => {
    const errors: string[] = [];

    // Vérifier que le projet a un nom
    if (!project.name || project.name.trim() === '') {
        errors.push('Le projet doit avoir un nom.');
    }

    // Vérifier chaque tâche
    project.tasks.forEach((task, index) => {
        // La tâche doit avoir un nom
        if (!task.name || task.name.trim() === '') {
            errors.push(`La tâche à l'index ${index} doit avoir un nom.`);
        }

        // La tâche doit avoir une durée valide
        if (task.duration <= 0) {
            errors.push(`La durée de la tâche "${task.name}" doit être positive.`);
        }

        // Les dépendances doivent faire référence à des tâches existantes
        const taskIds = project.tasks.map(t => t.id);
        task.dependencies.forEach(depId => {
            if (!taskIds.includes(depId)) {
                errors.push(`La tâche "${task.name}" a une dépendance vers une tâche inexistante (ID: ${depId}).`);
            }
        });
    });

    // Vérifier la connectivité du graphe
    const { nodes, edges } = calculatePertValues(project.tasks, 'start', 'end');
    if (nodes.length > 0) {
        // Vérifier s'il existe un chemin du début à la fin
        const visited = new Set<string>();
        const queue: string[] = ['start'];

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            visited.add(nodeId);

            // Trouver tous les successeurs
            edges
                .filter(edge => edge.source === nodeId)
                .forEach(edge => {
                    if (!visited.has(edge.target)) {
                        queue.push(edge.target);
                    }
                });
        }

        // Si 'end' n'est pas accessible
        if (!visited.has('end')) {
            errors.push('Le graphe PERT n\'est pas connecté. Il n\'existe pas de chemin du début à la fin.');
        }
    }

    return errors;
};