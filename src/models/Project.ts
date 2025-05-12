/**
 * Modèle pour les projets
 * Ce fichier définit l'interface et les types pour les projets
 */

import { Task, Milestone, Resource, TaskGroup } from './Task';

// Interface de base pour un projet
export interface Project {
    id: string;
    name: string;
    description?: string;
    tasks: Task[];
    milestones?: Milestone[];
    resources?: Resource[];
    taskGroups?: TaskGroup[];
    createdAt: Date | string;
    updatedAt: Date | string;
    type: 'gantt' | 'pert' |ProjectType;
    settings?: ProjectSettings;
    metadata?: Record<string, any>;
}

// Type de projet
export type ProjectType = 'gantt' | 'pert';

// Interface pour les paramètres du projet
export interface ProjectSettings {
    // Paramètres d'affichage
    workDays?: number[]; // Jours travaillés (0 = dimanche, 1 = lundi, etc.)
    hoursPerDay?: number; // Heures de travail par jour
    startDate?: Date | string; // Date de début du projet
    endDate?: Date | string; // Date de fin du projet
    showCriticalPath?: boolean; // Afficher le chemin critique
    timeUnit?: TimeUnit; // Unité de temps

    // Options de visualisation
    colorScheme?: string; // Schéma de couleurs pour les tâches
    viewMode?: ViewMode; // Mode d'affichage

    // Options de calcul
    autoCalculate?: boolean; // Calculer automatiquement les dates
    criticalPathMethod?: CriticalPathMethod; // Méthode de calcul du chemin critique
}

// Unité de temps pour le projet
export enum TimeUnit {
    HOURS = 'hours',
    DAYS = 'days',
    WEEKS = 'weeks',
    MONTHS = 'months'
}

// Mode d'affichage du projet
export enum ViewMode {
    HOUR = 'Hour',
    QUARTER_DAY = 'Quarter Day',
    HALF_DAY = 'Half Day',
    DAY = 'Day',
    WEEK = 'Week',
    MONTH = 'Month',
    YEAR = 'Year'
}

// Méthodes de calcul du chemin critique
export enum CriticalPathMethod {
    STANDARD = 'standard',
    RESOURCE_LEVELED = 'resource_leveled'
}

// Interface pour l'historique des versions du projet
export interface ProjectVersion {
    id: string;
    projectId: string;
    version: number;
    data: Project;
    timestamp: Date | string;
    userId?: string;
    comment?: string;
}

// Interface pour un modèle de projet
export interface ProjectTemplate {
    id: string;
    name: string;
    description?: string;
    type: ProjectType;
    tasks: Omit<Task, 'id' | 'start' | 'end'>[];
    taskGroups?: Omit<TaskGroup, 'id'>[];
    milestones?: Omit<Milestone, 'id' | 'date'>[];
    category?: string;
    tags?: string[];
}

// Interface pour les statistiques du projet
export interface ProjectStats {
    totalTasks: number;
    completedTasks: number;
    progress: number; // 0 à 100
    startDate: Date | string;
    endDate: Date | string;
    duration: number; // en jours
    criticalPathLength: number; // en jours
    resourceUtilization: number; // 0 à 100
    slack: number; // marge totale en jours
}

// Interface pour les statistiques de ressources
export interface ResourceStats {
    resourceId: string;
    utilization: number; // 0 à 100
    overallocation: boolean;
    overallocatedDays: number;
    taskCount: number;
}