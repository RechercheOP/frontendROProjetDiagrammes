/**
 * Utilitaires pour l'interface utilisateur
 * Ce fichier contient des fonctions utilitaires pour l'UI
 */

import { RefObject } from 'react';

/**
 * Générer une classe conditionnelle
 * @param classes Un objet où les clés sont les classes et les valeurs sont des booléens
 * @returns Une chaîne contenant les classes pour lesquelles la valeur est true
 */
export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
    return classes.filter(Boolean).join(' ');
};

/**
 * Tronquer un texte s'il dépasse une certaine longueur
 * @param text Le texte à tronquer
 * @param maxLength Longueur maximale
 * @returns Le texte tronqué avec des points de suspension si nécessaire
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

/**
 * Convertir une chaîne en slug URL
 * @param text Le texte à convertir
 * @returns Un slug URL valide
 */
export const slugify = (text: string): string => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

/**
 * Copier du texte dans le presse-papiers
 * @param text Le texte à copier
 * @returns Une promesse résolue si la copie a réussi, rejetée sinon
 */
export const copyToClipboard = async (text: string): Promise<void> => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error('Erreur lors de la copie dans le presse-papiers:', error);
        throw error;
    }
};

/**
 * Détecter si le thème du système est sombre
 * @returns Un booléen indiquant si le thème système est sombre
 */
export const isSystemDarkTheme = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Détecter si l'appareil est un mobile
 * @returns Un booléen indiquant si l'appareil est un mobile
 */
export const isMobileDevice = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Convertir un élément React en image base64
 * @param elementRef Référence à l'élément React
 * @returns Une promesse résolue avec l'URL de l'image en base64
 */
export const elementToDataUrl = async (elementRef: RefObject<HTMLElement>): Promise<string> => {
    if (!elementRef.current) {
        throw new Error('Élément non trouvé');
    }

    try {
        const { toPng } = await import('html-to-image');
        return await toPng(elementRef.current, { quality: 1.0, pixelRatio: 2 });
    } catch (error) {
        console.error('Erreur lors de la conversion en image:', error);
        throw error;
    }
};

/**
 * Télécharger un fichier depuis une URL
 * @param url URL du fichier
 * @param filename Nom du fichier
 */
export const downloadFile = (url: string, filename: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
};

/**
 * Détecter si un élément est visible dans le viewport
 * @param element Élément à vérifier
 * @param offset Décalage optionnel (0 par défaut)
 * @returns Booléen indiquant si l'élément est visible
 */
export const isElementInViewport = (element: HTMLElement, offset: number = 0): boolean => {
    const rect = element.getBoundingClientRect();

    return (
        rect.top >= 0 - offset &&
        rect.left >= 0 - offset &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
};

/**
 * Générer un identifiant unique
 * @param prefix Préfixe optionnel
 * @returns Une chaîne unique
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
};

/**
 * Formater un nombre avec séparateurs de milliers
 * @param num Le nombre à formater
 * @returns Le nombre formaté
 */
export const formatNumberWithCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Détecter les navigateurs modernes qui supportent certaines fonctionnalités
 * @returns Un objet avec des booléens pour différentes fonctionnalités
 */
export const detectBrowserFeatures = () => {
    if (typeof window === 'undefined') {
        return {
            supportsWebGL: false,
            supportsCSSGrid: false,
            supportsFlexbox: false,
        };
    }

    return {
        supportsWebGL: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(
                    window.WebGLRenderingContext &&
                    (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
                );
            } catch (e) {
                return false;
            }
        })(),
        supportsCSSGrid: (() => {
            return 'grid-template-columns' in document.documentElement.style;
        })(),
        supportsFlexbox: (() => {
            return 'flexBasis' in document.documentElement.style;
        })(),
    };
};