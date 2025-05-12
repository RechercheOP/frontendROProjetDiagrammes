/**
 * Service pour gérer les interactions avec le localStorage
 * Ce service fournit des méthodes génériques pour stocker et récupérer des données
 */

// Méthode générique pour sauvegarder des données dans le localStorage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans le localStorage:', error);
    }
};

// Méthode générique pour récupérer des données du localStorage
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return defaultValue;
        }
        return JSON.parse(serializedData) as T;
    } catch (error) {
        console.error('Erreur lors de la récupération depuis le localStorage:', error);
        return defaultValue;
    }
};

// Méthode pour supprimer des données du localStorage
export const removeFromLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Erreur lors de la suppression depuis le localStorage:', error);
    }
};

// Méthode pour vérifier si une clé existe dans le localStorage
export const existsInLocalStorage = (key: string): boolean => {
    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        console.error('Erreur lors de la vérification dans le localStorage:', error);
        return false;
    }
};

// Méthode pour obtenir toutes les clés qui commencent par un préfixe spécifique
export const getKeysWithPrefix = (prefix: string): string[] => {
    const keys: string[] = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des clés du localStorage:', error);
    }
    return keys;
};