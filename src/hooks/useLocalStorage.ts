/**
 * Hook personnalisé pour interagir avec le localStorage
 * Ce hook fournit des méthodes pour stocker, récupérer et gérer des données dans le localStorage
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour utiliser localStorage avec des valeurs typées
 * @param key Clé de stockage
 * @param initialValue Valeur initiale
 * @returns Un tuple contenant la valeur actuelle et des fonctions pour la manipuler
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
    // Créer une fonction d'état pour éviter de lire localStorage à chaque rendu
    const readValue = useCallback((): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error);
            return initialValue;
        }
    }, [initialValue, key]);

    // État pour stocker la valeur
    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Fonction pour définir une nouvelle valeur
    const setValue = (value: T | ((val: T) => T)): void => {
        try {
            // Permettre la valeur d'être une fonction
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Sauvegarder l'état
            setStoredValue(valueToStore);

            // Sauvegarder dans localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Erreur lors de l'écriture dans localStorage pour la clé "${key}":`, error);
        }
    };

    // Fonction pour supprimer la valeur
    const removeValue = (): void => {
        try {
            // Supprimer du localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }

            // Réinitialiser l'état
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Erreur lors de la suppression de localStorage pour la clé "${key}":`, error);
        }
    };

    // Écouter les changements de localStorage dans d'autres fenêtres
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== JSON.stringify(storedValue)) {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
            return () => window.removeEventListener('storage', handleStorageChange);
        }
        return undefined;
    }, [key, storedValue, initialValue]);

    return [storedValue, setValue, removeValue];
}

/**
 * Hook pour vérifier si une clé existe dans le localStorage
 * @param key Clé à vérifier
 * @returns Boolean indiquant si la clé existe
 */
export function useLocalStorageExists(key: string): boolean {
    const [exists, setExists] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setExists(window.localStorage.getItem(key) !== null);
        }
    }, [key]);

    return exists;
}

/**
 * Hook pour récupérer toutes les clés du localStorage qui commencent par un préfixe
 * @param prefix Préfixe des clés à récupérer
 * @returns Un tableau de clés
 */
export function useLocalStorageKeys(prefix: string): string[] {
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const foundKeys: string[] = [];
            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    foundKeys.push(key);
                }
            }
            setKeys(foundKeys);
        }
    }, [prefix]);

    return keys;
}