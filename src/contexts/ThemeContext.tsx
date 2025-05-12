/**
 * Contexte pour gérer le thème de l'application
 * Ce contexte permet de basculer entre les thèmes clair et sombre
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types de thème disponibles
type ThemeType = 'light' | 'dark';

// Interface pour le contexte de thème
interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

// Créer le contexte avec une valeur par défaut
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props pour le ThemeProvider
interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeType;
}

// Fournisseur de contexte pour le thème
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
                                                                children,
                                                                defaultTheme = 'dark' // Thème sombre par défaut comme demandé
                                                            }) => {
    // État local pour le thème actuel
    const [theme, setTheme] = useState<ThemeType>(() => {
        // Essayer de récupérer le thème depuis localStorage
        if (typeof window !== 'undefined') {
            const savedTheme = window.localStorage.getItem('theme') as ThemeType;
            return savedTheme || defaultTheme;
        }
        return defaultTheme;
    });

    // Effet pour appliquer la classe de thème au document
    useEffect(() => {
        const root = window.document.documentElement;

        // Supprimer les anciennes classes de thème
        root.classList.remove('light', 'dark');

        // Ajouter la nouvelle classe de thème
        root.classList.add(theme);

        // Sauvegarder le thème dans localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Fonction pour basculer entre les thèmes
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Valeur du contexte
    const contextValue: ThemeContextType = {
        theme,
        toggleTheme,
        setTheme
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte de thème
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
    }
    return context;
};

// Variables CSS pour les thèmes
export const themeColors = {
    light: {
        background: '#ffffff',
        foreground: '#111827',
        primary: '#000000',
        secondary: '#4b5563',
        accent: '#111827',
        card: '#f9fafb',
        border: '#e5e7eb',
        highlight: '#f3f4f6',
        muted: '#d1d5db'
    },
    dark: {
        background: '#111827',
        foreground: '#f9fafb',
        primary: '#ffffff',
        secondary: '#9ca3af',
        accent: '#ffffff',
        card: '#1f2937',
        border: '#374151',
        highlight: '#2d3748',
        muted: '#4b5563'
    }
};