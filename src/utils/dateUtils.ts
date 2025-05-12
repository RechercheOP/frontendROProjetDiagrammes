/**
 * Utilitaires pour la manipulation des dates
 * Ce fichier contient des fonctions utilitaires pour travailler avec les dates
 */

import { format, addDays, addWeeks, addMonths, differenceInDays, parse, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formater une date selon un format spécifique
 * @param date La date à formater
 * @param formatStr Le format de sortie (par défaut 'dd/MM/yyyy')
 * @returns La date formatée en chaîne de caractères
 */
export const formatDate = (
    date: Date | string | null | undefined,
    formatStr: string = 'dd/MM/yyyy'
): string => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr, { locale: fr });
    } catch (error) {
        console.error('Erreur lors du formatage de la date:', error);
        return '';
    }
};

/**
 * Parser une date depuis une chaîne de caractères
 * @param dateStr La chaîne de caractères à parser
 * @param formatStr Le format de la chaîne (par défaut 'dd/MM/yyyy')
 * @returns La date parsée ou null si invalide
 */
export const parseDate = (
    dateStr: string,
    formatStr: string = 'dd/MM/yyyy'
): Date | null => {
    try {
        const parsedDate = parse(dateStr, formatStr, new Date(), { locale: fr });
        return isValid(parsedDate) ? parsedDate : null;
    } catch (error) {
        console.error('Erreur lors du parsing de la date:', error);
        return null;
    }
};

/**
 * Calculer la différence en jours entre deux dates
 * @param startDate Date de début
 * @param endDate Date de fin
 * @returns Nombre de jours entre les deux dates (inclusif)
 */
export const calculateDuration = (
    startDate: Date | string,
    endDate: Date | string
): number => {
    try {
        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

        return differenceInDays(end, start) + 1; // +1 pour inclure le jour de fin
    } catch (error) {
        console.error('Erreur lors du calcul de la durée:', error);
        return 0;
    }
};

/**
 * Calculer la date de fin en fonction de la date de début et de la durée
 * @param startDate Date de début
 * @param duration Durée en jours
 * @returns Date de fin
 */
export const calculateEndDate = (
    startDate: Date | string,
    duration: number
): Date => {
    try {
        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        return addDays(start, duration - 1); // -1 car la durée inclut le jour de début
    } catch (error) {
        console.error('Erreur lors du calcul de la date de fin:', error);
        return new Date();
    }
};

/**
 * Calculer la date de début en fonction de la date de fin et de la durée
 * @param endDate Date de fin
 * @param duration Durée en jours
 * @returns Date de début
 */
export const calculateStartDate = (
    endDate: Date | string,
    duration: number
): Date => {
    try {
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
        return addDays(end, -(duration - 1)); // -1 car la durée inclut le jour de fin
    } catch (error) {
        console.error('Erreur lors du calcul de la date de début:', error);
        return new Date();
    }
};

/**
 * Générer un tableau de dates espacées régulièrement
 * @param startDate Date de début
 * @param endDate Date de fin
 * @param interval Intervalle ('day', 'week', 'month')
 * @returns Tableau de dates
 */
export const generateDateRange = (
    startDate: Date | string,
    endDate: Date | string,
    interval: 'day' | 'week' | 'month' = 'day'
): Date[] => {
    try {
        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

        const dates: Date[] = [];
        let currentDate = new Date(start);

        while (currentDate <= end) {
            dates.push(new Date(currentDate));

            switch (interval) {
                case 'day':
                    currentDate = addDays(currentDate, 1);
                    break;
                case 'week':
                    currentDate = addWeeks(currentDate, 1);
                    break;
                case 'month':
                    currentDate = addMonths(currentDate, 1);
                    break;
            }
        }

        return dates;
    } catch (error) {
        console.error('Erreur lors de la génération de la plage de dates:', error);
        return [];
    }
};

/**
 * Vérifier si une date est valide
 * @param date La date à vérifier (chaîne ISO ou objet Date)
 * @returns Booléen indiquant si la date est valide
 */
export const isValidDate = (date: any): boolean => {
    if (!date) return false;

    try {
        if (typeof date === 'string') {
            return isValid(parseISO(date));
        }
        return isValid(date);
    } catch (error) {
        return false;
    }
};

/**
 * Formater une durée en jours en texte lisible
 * @param days Nombre de jours
 * @returns Chaîne formatée (ex: "3 jours")
 */
export const formatDuration = (days: number): string => {
    if (days === 0) return '0 jour';
    if (days === 1) return '1 jour';
    return `${days} jours`;
};