import React, { useRef, useState, useEffect } from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { motion } from "framer-motion";
import { convertToGanttTasks } from '../../services/chart/ganttService';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useTheme } from '../../contexts/ThemeContext';
import GanttToolbar from './GanttToolbar';
import { exportGanttChart } from '../../services/export/imageExport';

// Styles personnalisés pour le diagramme de Gantt
import './GanttChart.css';

interface GanttChartProps {
    projectId?: string;
}

const GanttChart = React.forwardRef<HTMLDivElement, GanttChartProps>((props, ref) => {
    const { projectId } = props;
    const chartRef = useRef<HTMLDivElement>(null);
    const { project } = useProjectContext();
    const { theme } = useTheme();

    // États
    const [tasks, setTasks] = useState<Task[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Convertir les tâches du projet en format compatible avec gantt-task-react
    // Dans le composant GanttChart
    useEffect(() => {
        if (project) {
            setIsLoading(true);
            setError(null);

            try {
                // Utilisons setTimeout pour permettre au DOM de se mettre à jour
                setTimeout(() => {
                    try {
                        const ganttTasks = convertToGanttTasks(project);

                        // Vérification supplémentaire que toutes les tâches ont des dates valides
                        const validTasks = ganttTasks.filter(task =>
                            task.start instanceof Date && !isNaN(task.start.getTime()) &&
                            task.end instanceof Date && !isNaN(task.end.getTime())
                        );

                        if (validTasks.length !== ganttTasks.length) {
                            console.warn(`${ganttTasks.length - validTasks.length} tâches ont été filtrées car leurs dates étaient invalides.`);
                        }

                        setTasks(validTasks);
                        setIsLoading(false);
                    } catch (err) {
                        console.error("Erreur lors de la conversion des tâches pour Gantt:", err);
                        setError(`Erreur : ${err instanceof Error ? err.message : String(err)}`);
                        setIsLoading(false);
                    }
                }, 100);
            } catch (err) {
                console.error("Erreur générale:", err);
                setError(`Erreur : ${err instanceof Error ? err.message : String(err)}`);
                setIsLoading(false);
            }
        }
    }, [project]);

    // Gérer le clic sur une tâche
    const handleTaskClick = (task: Task) => {
        console.log("Task clicked", task);
    };

    // Gérer le changement de vue
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    // Gérer l'exportation du diagramme
    const handleExport = async (format: 'png' | 'jpeg' | 'svg' = 'png') => {
        if (project) {
            try {
                await exportGanttChart(project.name, format);
            } catch (error) {
                console.error("Erreur lors de l'exportation:", error);
            }
        }
    };

    if (!project) {
        return (
            <div className="flex h-96 w-full items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl shadow-inner">
                <p className="text-gray-500 dark:text-gray-400">Veuillez sélectionner ou créer un projet</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col w-full space-y-4"
            ref={ref || chartRef}
        >
            {/* Toolbar pour les contrôles et options */}
            <GanttToolbar
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onExport={handleExport}
            />

            {/* Container du diagramme avec état de chargement */}
            <div
                id="gantt-chart-container"
                className="w-full rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300"
            >
                {isLoading ? (
                    <div className="flex h-96 w-full items-center justify-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-black dark:text-white" role="status">
                            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Chargement...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col h-96 w-full items-center justify-center p-4">
                        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 mb-4">
                            <p className="text-red-800 dark:text-red-300">{error}</p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
                            Il y a eu un problème lors de l'affichage du diagramme Gantt. Essayez de vérifier les données de vos tâches.
                        </p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="flex flex-col h-96 w-full items-center justify-center p-4">
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                            Aucune tâche à afficher. Ajoutez des tâches à votre projet pour voir le diagramme Gantt.
                        </p>
                    </div>
                ) : (
                    <div className="gantt-chart-wrapper">
                        {(() => {
                            try {
                                return (
                                    <Gantt
                                        tasks={tasks}
                                        viewMode={viewMode}
                                        onDateChange={() => {}}
                                        onProgressChange={() => {}}
                                        onDoubleClick={handleTaskClick}
                                        onClick={handleTaskClick}
                                        columnWidth={60}
                                        barFill={75}
                                        headerHeight={50}
                                        barBackgroundColor={theme === 'dark' ? '#374151' : '#e5e7eb'}
                                        barProgressColor={theme === 'dark' ? '#ffffff' : '#000000'}
                                        barProgressSelectedColor={theme === 'dark' ? '#ffffff' : '#000000'}
                                        projectBackgroundColor={theme === 'dark' ? '#1f2937' : '#f3f4f6'}
                                        projectProgressColor={theme === 'dark' ? '#ffffff' : '#000000'}
                                        projectProgressSelectedColor={theme === 'dark' ? '#ffffff' : '#000000'}
                                        todayColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}
                                        TooltipContent={({ task }) => (
                                            <div className="bg-black text-white p-2 rounded text-xs">
                                                <p className="font-bold">{task.name}</p>
                                                <p>Début: {new Date(task.start).toLocaleDateString()}</p>
                                                <p>Fin: {new Date(task.end).toLocaleDateString()}</p>
                                                <p>Progression: {Math.round(task.progress * 100)}%</p>
                                            </div>
                                        )}
                                        locale="fr-FR"
                                    />
                                );
                            } catch (renderError) {
                                console.error("Erreur lors du rendu du diagramme Gantt:", renderError);
                                return (
                                    <div className="flex flex-col h-96 w-full items-center justify-center p-4">
                                        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 mb-4">
                                            <p className="text-red-800 dark:text-red-300">
                                                Erreur d'affichage: {renderError instanceof Error ? renderError.message : String(renderError)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

GanttChart.displayName = 'GanttChart';

export default GanttChart;