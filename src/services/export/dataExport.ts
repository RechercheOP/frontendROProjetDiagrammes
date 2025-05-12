/**
 * Service pour exporter les données des projets
 */

import { Project } from '../localStorage/projectStorage';

/**
 * Exporter un projet au format JSON
 * @param project Le projet à exporter
 * @param fileName Nom du fichier (sans extension)
 */
export const exportToJson = (project: Project, fileName: string = 'project'): void => {
    try {
        // Convertir le projet en chaîne JSON
        const jsonData = JSON.stringify(project, null, 2);

        // Créer un blob avec les données
        const blob = new Blob([jsonData], { type: 'application/json' });

        // Créer une URL pour le blob
        const url = URL.createObjectURL(blob);

        // Créer un lien de téléchargement et déclencher le téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libérer l'URL du blob
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erreur lors de l\'exportation au format JSON:', error);
        throw error;
    }
};

/**
 * Exporter un projet au format CSV (uniquement les tâches)
 * @param project Le projet à exporter
 * @param fileName Nom du fichier (sans extension)
 */
export const exportToCsv = (project: Project, fileName: string = 'project-tasks'): void => {
    try {
        // Définir les en-têtes CSV
        const headers = ['ID', 'Nom', 'Début', 'Fin', 'Durée', 'Progression', 'Dépendances', 'Ressources'];

        // Convertir les tâches en lignes CSV
        const rows = project.tasks.map(task => {
            const start = typeof task.start === 'string' ? task.start : task.start.toISOString();
            const end = typeof task.end === 'string' ? task.end : task.end.toISOString();

            return [
                task.id,
                task.name,
                start,
                end,
                task.duration.toString(),
                task.progress.toString(),
                task.dependencies.join(';'),
                (task.resources || []).join(';')
            ];
        });

        // Ajouter les en-têtes aux lignes
        rows.unshift(headers);

        // Convertir les lignes en chaîne CSV
        const csvContent = rows
            .map(row =>
                row.map(cell =>
                    // Échapper les virgules et les guillemets
                    typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
                        ? `"${cell.replace(/"/g, '""')}"`
                        : cell
                ).join(',')
            )
            .join('\n');

        // Créer un blob avec les données
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Créer une URL pour le blob
        const url = URL.createObjectURL(blob);

        // Créer un lien de téléchargement et déclencher le téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Libérer l'URL du blob
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erreur lors de l\'exportation au format CSV:', error);
        throw error;
    }
};

/**
 * Importer un projet depuis un fichier JSON
 * @param file Le fichier à importer
 * @returns Une promesse qui résout avec le projet importé
 */
export const importFromJson = (file: File): Promise<Project> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const jsonData = event.target?.result as string;
                const project = JSON.parse(jsonData) as Project;

                // Validation de base pour s'assurer que c'est un projet valide
                if (!project.id || !project.name || !project.tasks || !Array.isArray(project.tasks)) {
                    reject(new Error('Format de projet invalide.'));
                    return;
                }

                resolve(project);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Erreur lors de la lecture du fichier.'));
        };

        reader.readAsText(file);
    });
};