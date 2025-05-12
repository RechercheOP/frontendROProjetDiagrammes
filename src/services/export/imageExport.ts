/**
 * Service pour exporter les diagrammes en image
 */

import { toPng, toJpeg, toSvg } from 'html-to-image';

export type ExportFormat = 'png' | 'jpeg' | 'svg';

/**
 * Exporter un élément HTML en image
 * @param elementId ID de l'élément HTML à exporter
 * @param format Format de l'image (png, jpeg, svg)
 * @param fileName Nom du fichier (sans extension)
 */
export const exportToImage = async (
    elementId: string,
    format: ExportFormat = 'png',
    fileName: string = 'diagram'
): Promise<void> => {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Élément avec l'ID ${elementId} non trouvé.`);
    }

    try {
        let dataUrl: string;
        let extension: string;

        // Générer l'image selon le format demandé
        switch (format) {
            case 'jpeg':
                dataUrl = await toJpeg(element, { quality: 0.95 });
                extension = 'jpg';
                break;
            case 'svg':
                dataUrl = await toSvg(element);
                extension = 'svg';
                break;
            case 'png':
            default:
                dataUrl = await toPng(element, { quality: 0.95 });
                extension = 'png';
                break;
        }

        // Créer un lien de téléchargement et déclencher le téléchargement
        const link = document.createElement('a');
        link.download = `${fileName}.${extension}`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Erreur lors de l\'exportation en image:', error);
        throw error;
    }
};

/**
 * Exporter un diagramme Gantt en image
 * @param projectName Nom du projet (utilisé pour le nom du fichier)
 * @param format Format de l'image (png, jpeg, svg)
 */
export const exportGanttChart = async (
    projectName: string = 'gantt-chart',
    format: ExportFormat = 'png'
): Promise<void> => {
    try {
        await exportToImage('gantt-chart-container', format, projectName);
    } catch (error) {
        console.error('Erreur lors de l\'exportation du diagramme Gantt:', error);
        throw error;
    }
};

/**
 * Exporter un diagramme PERT en image
 * @param projectName Nom du projet (utilisé pour le nom du fichier)
 * @param format Format de l'image (png, jpeg, svg)
 */
export const exportPertChart = async (
    projectName: string = 'pert-chart',
    format: ExportFormat = 'png'
): Promise<void> => {
    try {
        await exportToImage('pert-chart-container', format, projectName);
    } catch (error) {
        console.error('Erreur lors de l\'exportation du diagramme PERT:', error);
        throw error;
    }
};

/**
 * Préparer un élément pour l'exportation (ajuster les styles, etc.)
 * @param elementId ID de l'élément HTML à préparer
 * @param backgroundColor Couleur de fond
 */
export const prepareForExport = (
    elementId: string,
    backgroundColor: string = '#ffffff'
): void => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Sauvegarder les styles originaux
    const originalStyles = {
        backgroundColor: element.style.backgroundColor,
        padding: element.style.padding,
        border: element.style.border,
        boxShadow: element.style.boxShadow
    };

    // Appliquer les styles pour l'exportation
    element.style.backgroundColor = backgroundColor;
    element.style.padding = '20px';
    element.style.border = 'none';
    element.style.boxShadow = 'none';

    // Retourner une fonction pour restaurer les styles originaux
    return () => {
        element.style.backgroundColor = originalStyles.backgroundColor;
        element.style.padding = originalStyles.padding;
        element.style.border = originalStyles.border;
        element.style.boxShadow = originalStyles.boxShadow;
    };
};