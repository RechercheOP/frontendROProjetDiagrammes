/**
 * Composant pour la barre d'outils du diagramme PERT
 * Ce composant offre des contrôles pour manipuler le diagramme
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExportFormat } from '../../services/export/imageExport';
import { useTheme } from '../../contexts/ThemeContext';

interface PertToolbarProps {
    onExport?: (format: ExportFormat) => Promise<void>;
}

const PertToolbar: React.FC<PertToolbarProps> = ({
                                                     onExport
                                                 }) => {
    const { theme } = useTheme();
    const [showExportOptions, setShowExportOptions] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const exportOptionsRef = useRef<HTMLDivElement>(null);

    // Gérer le clic en dehors du menu d'export
    const handleClickOutside = (e: MouseEvent) => {
        if (exportOptionsRef.current && !exportOptionsRef.current.contains(e.target as Node)) {
            setShowExportOptions(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setShowHelpModal(true)}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all duration-200"
                >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Aide sur PERT
          </span>
                </button>

                <span className="h-6 border-l border-gray-300 dark:border-gray-600"></span>

                <span className="text-gray-700 dark:text-gray-300 text-sm">
          <span className="font-medium mr-1">Légende:</span>
          <span className="inline-flex items-center mx-1">
            <span className="w-3 h-3 inline-block rounded-sm border border-red-500 mr-1"></span>
            Chemin critique
          </span>
          •
          <span className="inline-flex items-center mx-1">
            <span className="w-3 h-3 inline-block bg-gray-200 dark:bg-gray-700 rounded-sm mr-1"></span>
            Tâches
          </span>
        </span>
            </div>

            <div className="flex items-center space-x-4">
                {/* Menu d'export */}
                <div className="relative" ref={exportOptionsRef}>
                    <button
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exporter
                    </button>

                    <AnimatePresence>
                        {showExportOptions && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden"
                            >
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            onExport?.('png');
                                            setShowExportOptions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        PNG Image
                                    </button>
                                    <button
                                        onClick={() => {
                                            onExport?.('jpeg');
                                            setShowExportOptions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        JPEG Image
                                    </button>
                                    <button
                                        onClick={() => {
                                            onExport?.('svg');
                                            setShowExportOptions(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        SVG Vector
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Options
                </button>
            </div>

            {/* Modal d'aide */}
            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guide du Diagramme PERT</h2>
                                    <button
                                        onClick={() => setShowHelpModal(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Qu'est-ce qu'un diagramme PERT?</h3>
                                        <p>Un diagramme PERT (Program Evaluation and Review Technique) est un outil de gestion de projet qui permet de visualiser et d'analyser les tâches nécessaires pour compléter un projet.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Éléments du diagramme</h3>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><span className="font-medium">Nœuds</span> : Représentent les tâches du projet</li>
                                            <li><span className="font-medium">Arêtes</span> : Représentent les dépendances entre les tâches</li>
                                            <li><span className="font-medium">Chemin critique</span> : Le chemin le plus long à travers le réseau, indiqué en rouge</li>
                                            <li><span className="font-medium">ES (Earliest Start)</span> : Date de début au plus tôt</li>
                                            <li><span className="font-medium">EF (Earliest Finish)</span> : Date de fin au plus tôt</li>
                                            <li><span className="font-medium">LS (Latest Start)</span> : Date de début au plus tard</li>
                                            <li><span className="font-medium">LF (Latest Finish)</span> : Date de fin au plus tard</li>
                                            <li><span className="font-medium">Marge</span> : Retard possible sans impact sur la durée totale</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Navigation et interaction</h3>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><span className="font-medium">Zoom</span> : Utilisez la molette de la souris ou les boutons de contrôle</li>
                                            <li><span className="font-medium">Déplacement</span> : Cliquez et faites glisser pour naviguer dans le diagramme</li>
                                            <li><span className="font-medium">Sélection</span> : Cliquez sur un nœud pour le sélectionner</li>
                                            <li><span className="font-medium">Informations</span> : Survolez un nœud pour voir plus de détails</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-xl">
                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PertToolbar;