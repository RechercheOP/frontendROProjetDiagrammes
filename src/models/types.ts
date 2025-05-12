/**
 * Types et interfaces communs
 * Ce fichier contient des types et interfaces utilisés dans toute l'application
 */

// Type pour l'identifiant
export type ID = string;

// Interface pour les données utilisateur
export interface User {
    id: ID;
    name: string;
    email?: string;
    avatar?: string;
}

// Interface pour les notifications
export interface Notification {
    id: ID;
    type: NotificationType;
    message: string;
    timestamp: Date | string;
    read: boolean;
    data?: Record<string, any>;
}

// Types de notifications
export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

// Interface pour les options de tri
export interface SortOption<T = string> {
    field: T;
    direction: 'asc' | 'desc';
}

// Interface pour les options de pagination
export interface PaginationOptions {
    page: number;
    pageSize: number;
    totalItems?: number;
    totalPages?: number;
}

// Interface pour les résultats paginés
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

// Interface pour les options de filtrage
export interface FilterOptions<T = any> {
    field: keyof T;
    operator: FilterOperator;
    value: any;
}

// Opérateurs de filtre
export enum FilterOperator {
    EQUALS = 'equals',
    NOT_EQUALS = 'not_equals',
    GREATER_THAN = 'greater_than',
    LESS_THAN = 'less_than',
    CONTAINS = 'contains',
    STARTS_WITH = 'starts_with',
    ENDS_WITH = 'ends_with'
}

// Interface pour un point dans un graphique
export interface Point {
    x: number;
    y: number;
}

// Interface pour une dimension
export interface Dimension {
    width: number;
    height: number;
}

// Interface pour une réponse d'API
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    statusCode?: number;
}

// Interface pour les métadonnées de l'application
export interface AppMetadata {
    version: string;
    buildNumber: string;
    environment: 'development' | 'production' | 'testing';
    features: Record<string, boolean>;
}

// Interface pour les thèmes
export interface Theme {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    text: string;
    border: string;
}

// Interface pour les options de tableau
export interface TableOptions<T = any> {
    columns: TableColumn<T>[];
    sortable?: boolean;
    filterable?: boolean;
    pagination?: PaginationOptions;
    sort?: SortOption<keyof T>;
    filters?: FilterOptions<T>[];
}

// Interface pour les colonnes de tableau
export interface TableColumn<T = any> {
    field: keyof T;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    width?: string | number;
    render?: (value: any, row: T) => JSX.Element;
}

// Interface pour les options de graphique
export interface ChartOptions {
    title?: string;
    xAxis?: {
        title?: string;
        type?: 'category' | 'time' | 'linear';
    };
    yAxis?: {
        title?: string;
        min?: number;
        max?: number;
    };
    legend?: boolean;
    tooltip?: boolean;
    colors?: string[];
}

// Interface pour un événement avec date
export interface DateEvent {
    id: ID;
    title: string;
    start: Date | string;
    end?: Date | string;
    allDay?: boolean;
    color?: string;
    data?: Record<string, any>;
}