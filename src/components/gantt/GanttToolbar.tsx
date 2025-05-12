/**
 * Composant pour la barre d'outils du diagramme de Gantt
 * Ce composant offre des contrôles pour manipuler le diagramme
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewMode } from 'gantt-task-react';
import { ExportFormat } from '../../services/export/imageExport';
import { useTheme } from '../../contexts/ThemeContext';

interface GanttToolbarProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onExport?: (format: ExportFormat) => Promise<void>;
}

const GanttToolbar: React.FC<GanttToolbarProps> = ({
                                                       viewMode,
                                                       onViewModeChange,
                                                       onExport
                                                   }) => {
    const { theme } = useTheme();
    const [showExportOptions, setShowExportOptions] = useState(false);
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

    // Style actif pour le bouton de mode sélectionné
    const getButtonStyle = (mode: ViewMode) => {
        const baseStyle = "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200";
        if (mode === viewMode) {
            return `${baseStyle} bg-black text-white dark:bg-white dark:text-black shadow-md`;
        }
        return `${baseStyle} bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onViewModeChange(ViewMode.Day)}
                    className={getButtonStyle(ViewMode.Day)}
                >
                    Jour
                </button>
                <button
                    onClick={() => onViewModeChange(ViewMode.Week)}
                    className={getButtonStyle(ViewMode.Week)}
                >
                    Semaine
                </button>
                <button
                    onClick={() => onViewModeChange(ViewMode.Month)}
                    className={getButtonStyle(ViewMode.Month)}
                >
                    Mois
                </button>
                <button
                    onClick={() => onViewModeChange(ViewMode.Year)}
                    className={getButtonStyle(ViewMode.Year)}
                >
                    Année
                </button>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                    </svg>
                    Options
                </button>
            </div>
        </motion.div>
    );
};

export default GanttToolbar;