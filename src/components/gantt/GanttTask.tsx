/**
 * Composant pour la gestion d'une tâche dans le diagramme de Gantt
 * Ce composant permet de visualiser et d'éditer une tâche individuelle
 */

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { format, parseISO } from 'date-fns';
import { Task } from '../../services/localStorage/projectStorage';
import { useProjectContext } from '../../contexts/ProjectContext';

interface GanttTaskProps {
    task: Task;
    isCritical: boolean;
    isSelected?: boolean;
    onSelect?: (taskId: string) => void;
}

const GanttTask: React.FC<GanttTaskProps> = ({
                                                 task,
                                                 isCritical,
                                                 isSelected = false,
                                                 onSelect
                                             }) => {
    const { updateTask } = useProjectContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(task.name);
    const [editedProgress, setEditedProgress] = useState(task.progress);

    // Formater les dates
    const startDate = typeof task.start === 'string' ? parseISO(task.start) : task.start;
    const endDate = typeof task.end === 'string' ? parseISO(task.end) : task.end;

    const formattedStartDate = format(startDate, 'dd/MM/yyyy');
    const formattedEndDate = format(endDate, 'dd/MM/yyyy');

    // Gérer la sélection de la tâche
    const handleClick = () => {
        if (onSelect) {
            onSelect(task.id);
        }
    };

    // Gérer l'entrée en mode édition
    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    // Gérer la soumission du formulaire d'édition
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTask(task.id, {
            name: editedName,
            progress: editedProgress
        });
        setIsEditing(false);
    };

    // Calculer les styles en fonction des propriétés
    const getBgColor = () => {
        if (isSelected) return 'bg-black dark:bg-white text-white dark:text-black';
        if (isCritical) return 'bg-black/90 dark:bg-white/90 text-white dark:text-black';
        return 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white';
    };

    // Afficher le formulaire d'édition
    if (isEditing) {
        return (
            <motion.div
                initial={{ scale: 0.98, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg bg-white dark:bg-gray-800"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nom de la tâche
                            </label>
                            <input
                                type="text"
                                id="task-name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="task-progress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progression ({editedProgress}%)
                            </label>
                            <input
                                type="range"
                                id="task-progress"
                                min="0"
                                max="100"
                                value={editedProgress}
                                onChange={(e) => setEditedProgress(Number(e.target.value))}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        );
    }

    // Afficher la tâche
    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={`p-3 rounded-lg cursor-pointer select-none transition-all duration-200 ${getBgColor()} shadow-sm hover:shadow-md`}
            style={{
                borderLeft: isCritical ? '4px solid #ff4d4f' : '4px solid transparent'
            }}
        >
            <div className="flex justify-between items-center">
                <h3 className="font-medium">{task.name}</h3>
                {isCritical && (
                    <span className="text-xs px-2 py-0.5 bg-red-500 text-white dark:bg-red-600 dark:text-white rounded-full">
            Critique
          </span>
                )}
            </div>

            <div className="mt-2 text-sm opacity-80">
                <div className="flex items-center space-x-4">
                    <div>
                        <span className="font-medium">Début:</span> {formattedStartDate}
                    </div>
                    <div>
                        <span className="font-medium">Fin:</span> {formattedEndDate}
                    </div>
                </div>
            </div>

            <div className="mt-3 relative pt-1">
                <div className="flex items-center justify-between">
                    <div>
            <span className="text-xs font-medium inline-block py-1 px-2 uppercase rounded-full bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
              Progression
            </span>
                    </div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {task.progress}%
                    </div>
                </div>
                <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-gray-300 dark:bg-gray-600">
                    <motion.div
                        style={{ width: `${task.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500 dark:bg-gray-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    ></motion.div>
                </div>
            </div>

            {task.dependencies.length > 0 && (
                <div className="mt-2 text-xs">
                    <span className="font-medium">Dépendances:</span> {task.dependencies.join(', ')}
                </div>
            )}
        </motion.div>
    );
};

export default GanttTask;