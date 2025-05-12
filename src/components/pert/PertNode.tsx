/**
 * Composant pour un nœud dans le diagramme PERT
 * Ce composant définit l'apparence et le comportement d'un nœud PERT
 */

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface PertNodeData {
    label: string;
    taskId?: string;
    est?: number; // Earliest Start Time
    lst?: number; // Latest Start Time
    eft?: number; // Earliest Finish Time
    lft?: number; // Latest Finish Time
    slack?: number; // Float
    isCritical?: boolean;
    duration?: number;
}

const PertNode: React.FC<NodeProps<PertNodeData>> = ({
                                                         data,
                                                         id,
                                                         type,
                                                         selected
                                                     }) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    // Déterminer le style du nœud en fonction du type et de l'état
    const getNodeStyle = () => {
        // Style de base
        const baseStyle = {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            transition: 'all 0.3s ease',
        };

        // Styles spécifiques par type
        if (type === 'start') {
            return {
                ...baseStyle,
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
            };
        }

        if (type === 'end') {
            return {
                ...baseStyle,
                background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
            };
        }

        // Style pour les nœuds critiques
        if (data.isCritical) {
            return {
                ...baseStyle,
                borderColor: '#ff4d4f',
                borderWidth: '2px',
                boxShadow: `0 0 8px 0 ${theme === 'dark' ? 'rgba(255, 77, 79, 0.3)' : 'rgba(255, 77, 79, 0.2)'}`
            };
        }

        // Style pour les nœuds sélectionnés
        if (selected) {
            return {
                ...baseStyle,
                borderColor: theme === 'dark' ? '#ffffff' : '#000000',
                borderWidth: '2px',
                boxShadow: `0 0 0 2px ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
            };
        }

        return baseStyle;
    };

    // Déterminer une classe CSS en fonction du type de nœud
    const getNodeClassName = () => {
        let className = 'rounded-xl border p-4 shadow-md';

        if (type === 'start' || type === 'end') {
            className += ' min-w-[100px] min-h-[60px]';
        } else {
            className += ' min-w-[180px]';
        }

        if (selected) {
            className += ' ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-black dark:ring-white';
        }

        if (data.isCritical) {
            className += ' critical-path';
        }

        return className;
    };

    return (
        <>
            {/* Poignée d'entrée de connexion (invisible pour le nœud de début) */}
            {type !== 'start' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        background: data.isCritical ? '#ff4d4f' : theme === 'dark' ? '#ffffff' : '#000000',
                        width: 8,
                        height: 8,
                        border: 'none',
                    }}
                />
            )}

            {/* Contenu du nœud */}
            <motion.div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.02, y: -3 }}
                style={getNodeStyle()}
                className={getNodeClassName()}
            >
                {/* En-tête du nœud */}
                <div className="font-medium text-sm mb-2 text-center">
                    {data.label}
                </div>

                {/* Informations détaillées pour les nœuds de tâches */}
                {type === 'task' && (
                    <div className="text-xs grid grid-cols-2 gap-1">
                        {data.est !== undefined && data.eft !== undefined && (
                            <>
                                <div className="border-r pr-2 border-gray-200 dark:border-gray-700">
                                    <div className="font-medium mb-1">Au plus tôt</div>
                                    <div className="flex justify-between">
                                        <span>Début:</span>
                                        <span>{data.est}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Fin:</span>
                                        <span>{data.eft}</span>
                                    </div>
                                </div>
                                <div className="pl-2">
                                    <div className="font-medium mb-1">Au plus tard</div>
                                    <div className="flex justify-between">
                                        <span>Début:</span>
                                        <span>{data.lst}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Fin:</span>
                                        <span>{data.lft}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Informations supplémentaires avec animation */}
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                                opacity: isHovered ? 1 : 0,
                                height: isHovered ? 'auto' : 0
                            }}
                            className="col-span-2 mt-2 overflow-hidden"
                        >
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between">
                                    <span>Durée:</span>
                                    <span>{data.duration || 0} jour{(data.duration || 0) > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Marge:</span>
                                    <span className={`${data.slack === 0 ? 'text-red-500 font-semibold' : ''}`}>
                    {data.slack} jour{(data.slack || 0) > 1 ? 's' : ''}
                  </span>
                                </div>
                                {data.isCritical && (
                                    <div className="mt-1 py-0.5 px-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-center">
                                        Chemin critique
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            {/* Poignée de sortie de connexion (invisible pour le nœud de fin) */}
            {type !== 'end' && (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        background: data.isCritical ? '#ff4d4f' : theme === 'dark' ? '#ffffff' : '#000000',
                        width: 8,
                        height: 8,
                        border: 'none',
                    }}
                />
            )}
        </>
    );
};

export default memo(PertNode);