/**
 * Modèle pour les tâches
 * Ce fichier définit l'interface et les types pour les tâches
 */

// Interface de base pour une tâche
export interface Task {
    id: string;
    name: string;
    start: Date | string;
    end: Date | string;
    duration: number;
    progress: number; // 0 à 100
    dependencies: string[];
    resources?: string[];
    color?: string;
    isComplete?: boolean;
    description?: string;
    priority?: TaskPriority;
    assignee?: string;
    tags?: string[];
    notes?: string;
}

// Énumération des priorités possibles pour une tâche
export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// Interface pour les événements de jalon (milestone)
export interface Milestone {
    id: string;
    name: string;
    date: Date | string;
    description?: string;
    completed: boolean;
    color?: string;
}

// Interface pour les ressources assignables aux tâches
export interface Resource {
    id: string;
    name: string;
    type: ResourceType;
    availability?: number; // Pourcentage de disponibilité (0-100)
    cost?: number; // Coût par unité de temps
    calendar?: ResourceCalendar; // Calendrier de disponibilité
    skills?: string[]; // Compétences
}

// Énumération des types de ressources
export enum ResourceType {
    HUMAN = 'human',
    MATERIAL = 'material',
    EQUIPMENT = 'equipment'
}

// Interface pour le calendrier de disponibilité d'une ressource
export interface ResourceCalendar {
    workDays: number[]; // 0 = dimanche, 1 = lundi, etc.
    workHours: {
        start: string; // Format 'HH:MM'
        end: string;   // Format 'HH:MM'
    };
    holidays: Date[] | string[]; // Jours fériés ou congés
}

// Interface pour les allocations de ressources
export interface ResourceAllocation {
    taskId: string;
    resourceId: string;
    assignmentPercent: number; // Pourcentage d'allocation (0-100)
}

// Interface pour les dépendances entre tâches
export interface TaskDependency {
    predecessorId: string;
    successorId: string;
    type: DependencyType;
    lag?: number; // Délai en jours
}

// Énumération des types de dépendances
export enum DependencyType {
    FINISH_TO_START = 'FS', // Fin à Début (standard)
    START_TO_START = 'SS',  // Début à Début
    FINISH_TO_FINISH = 'FF', // Fin à Fin
    START_TO_FINISH = 'SF'   // Début à Fin (rare)
}

// Interface pour une valeur calculée d'une tâche dans un réseau PERT
export interface TaskValue {
    id: string;
    es: number; // Earliest Start
    ef: number; // Earliest Finish
    ls: number; // Latest Start
    lf: number; // Latest Finish
    slack: number;
    isCritical: boolean;
}

// Interface pour les contraintes de temps sur une tâche
export interface TaskConstraint {
    taskId: string;
    type: ConstraintType;
    date: Date | string;
}

// Énumération des types de contraintes
export enum ConstraintType {
    START_NO_EARLIER_THAN = 'SNET',
    START_NO_LATER_THAN = 'SNLT',
    FINISH_NO_EARLIER_THAN = 'FNET',
    FINISH_NO_LATER_THAN = 'FNLT',
    MUST_START_ON = 'MSO',
    MUST_FINISH_ON = 'MFO'
}

// Interface pour un groupement de tâches (WBS)
export interface TaskGroup {
    id: string;
    name: string;
    taskIds: string[];
    color?: string;
    collapsed?: boolean;
}

// Interface pour une mise à jour de tâche
export interface TaskUpdate {
    id: string;
    changes: Partial<Task>;
    timestamp: Date | string;
    userId?: string;
}