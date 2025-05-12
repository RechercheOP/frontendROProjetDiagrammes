/**
 * Service pour gérer le stockage des projets dans le localStorage
 * Ce service utilise les méthodes génériques du localStorageService
 * pour gérer spécifiquement les projets de diagrammes Gantt et PERT
 */

import {
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    getKeysWithPrefix,
    existsInLocalStorage
} from './localStorageService';

// Préfixe pour toutes les clés de projets dans le localStorage
const PROJECT_PREFIX = 'project_';

// Types de base pour les projets et les tâches
export interface Task {
    id: string;
    name: string;
    start: Date | string; // Date pour utilisation, string pour stockage
    end: Date | string;   // Date pour utilisation, string pour stockage
    duration: number;     // en jours
    progress: number;     // 0 à 100
    dependencies: string[];
    resources?: string[];
    color?: string;
    isComplete?: boolean;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    tasks: Task[];
    createdAt: Date | string;
    updatedAt: Date | string;
    type: 'gantt' | 'pert';
}

// Méthode pour sauvegarder un projet
export const saveProject = (project: Project): void => {
    // Assurer que les dates sont converties en string pour le stockage
    const processedProject = {
        ...project,
        createdAt: project.createdAt instanceof Date ? project.createdAt.toISOString() : project.createdAt,
        updatedAt: new Date().toISOString(),
        tasks: project.tasks.map(task => ({
            ...task,
            start: task.start instanceof Date ? task.start.toISOString() : task.start,
            end: task.end instanceof Date ? task.end.toISOString() : task.end
        }))
    };

    saveToLocalStorage(`${PROJECT_PREFIX}${project.id}`, processedProject);
};

// Méthode pour récupérer un projet par son ID
export const getProject = (projectId: string): Project | null => {
    const key = `${PROJECT_PREFIX}${projectId}`;
    if (!existsInLocalStorage(key)) {
        return null;
    }

    const project = getFromLocalStorage<Project>(key, null as unknown as Project);
    return project;
};

// Méthode pour récupérer tous les projets
export const getAllProjects = (): Project[] => {
    const projectKeys = getKeysWithPrefix(PROJECT_PREFIX);
    return projectKeys.map(key =>
        getFromLocalStorage<Project>(key, null as unknown as Project)
    ).filter(project => project !== null);
};

// Méthode pour supprimer un projet
export const deleteProject = (projectId: string): void => {
    removeFromLocalStorage(`${PROJECT_PREFIX}${projectId}`);
};

// Méthode pour créer un nouveau projet
export const createProject = (name: string, description: string = '', type: 'gantt' | 'pert'): Project => {
    const now = new Date();
    const project: Project = {
        id: `${now.getTime()}`, // Utiliser le timestamp comme ID unique
        name,
        description,
        tasks: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        type
    };

    saveProject(project);
    return project;
};

// Méthode pour mettre à jour un projet existant
export const updateProject = (project: Project): void => {
    const existingProject = getProject(project.id);
    if (!existingProject) {
        throw new Error(`Le projet avec l'ID ${project.id} n'existe pas.`);
    }

    saveProject({
        ...project,
        updatedAt: new Date().toISOString()
    });
};