/**
 * Composant principal du diagramme PERT
 * Ce composant affiche le graphe PERT avec les nœuds et arêtes
 */

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    Background,
    Controls,
    ConnectionLineType,
    Node,
    Edge,
    useReactFlow, applyEdgeChanges, applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectContext } from '../../contexts/ProjectContext';
import { PertGraph, convertToPertGraph } from '../../services/chart/pertService';
import { useTheme } from '../../contexts/ThemeContext';
import PertToolbar from './PertToolbar';
import PertNode from './PertNode';
import PertEdge from './PertEdge';
import { exportPertChart } from '../../services/export/imageExport';

// Styles personnalisés pour le diagramme PERT
import './PertChart.css';
import {BackgroundVariant} from "@reactflow/background/dist/esm/types";

// Types de nœuds personnalisés
const nodeTypes = {
    task: PertNode,
    start: PertNode,
    end: PertNode
};

// Types d'arêtes personnalisés
const edgeTypes = {
    default: PertEdge,
};

interface PertChartProps {
    projectId?: string;
}

// Composant interne pour utiliser les hooks de ReactFlow
const PertChartInner: React.FC<{ graph: PertGraph | null }> = ({ graph }) => {
    const { fitView } = useReactFlow();
    const { theme } = useTheme();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // Mettre à jour le diagramme lorsque le graphe change
    useEffect(() => {
        if (graph) {
            // Convertir les nœuds et arêtes PERT en format ReactFlow
            const flowNodes = graph.nodes.map(node => ({
                id: node.id,
                type: node.type || 'task',
                position: node.position,
                draggable: true, // Rendre les nœuds déplaçables
                data: {
                    label: node.label,
                    ...node.data,
                    isCritical: graph.criticalPath.includes(node.id)
                },
                style: {
                    ...node.style,
                    borderColor: graph.criticalPath.includes(node.id)
                        ? '#ff4d4f'
                        : theme === 'dark' ? '#10d38e' : '#e1e70f'
                }
            }));

            const flowEdges = graph.edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.label,
                animated: edge.animated,
                type: 'default',
                style: {
                    ...edge.style,
                    stroke: graph.criticalPath.includes(edge.source) && graph.criticalPath.includes(edge.target)
                        ? '#ff4d4f'
                        : theme === 'dark' ? '#01c581' : '#e1e70f'
                }
            }));

            setNodes(flowNodes);
            setEdges(flowEdges);

            // Ajuster la vue pour voir tout le diagramme
            setTimeout(() => {
                fitView({ padding: 0.2 });
            }, 300);
        }
    }, [graph, theme, fitView]);

    // Gérer le déplacement des nœuds
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    // Gérer les changements d'arêtes
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    if (!graph) return null;

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange} // Ajouter le gestionnaire de changement de nœuds
            onEdgesChange={onEdgesChange} // Ajouter le gestionnaire de changement d'arêtes
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultZoom={1}
            minZoom={0.2}
            maxZoom={4}
            attributionPosition="bottom-right"
            fitView
            panOnScroll
            selectNodesOnDrag={false} // Désactiver la sélection de nœuds lors du déplacement
            nodesDraggable={true} // Rendre les nœuds déplaçables
            nodesConnectable={false} // Désactiver la connexion de nœuds (optionnel)
            proOptions={{ hideAttribution: true }}
        >
            <Background
                color={theme === 'dark' ? '#374151' : '#e5e7eb'}
                gap={16}
                size={1}
                variant="dots"
            />
            <Controls />
        </ReactFlow>
    );
};
// Composant principal
const PertChart: React.FC<PertChartProps> = ({ projectId }) => {
    const { project } = useProjectContext();
    const [pertGraph, setPertGraph] = useState<PertGraph | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Convertir le projet en graphe PERT
    useEffect(() => {
        if (project) {
            setIsLoading(true);
            try {
                const graph = convertToPertGraph(project);
                setPertGraph(graph);
            } catch (error) {
                console.error("Erreur lors de la conversion en graphe PERT:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [project]);

    // Gérer l'exportation du diagramme
    const handleExport = async (format: 'png' | 'jpeg' | 'svg' = 'png') => {
        if (project) {
            try {
                await exportPertChart(project.name, format);
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
        >
            {/* Toolbar pour les contrôles et options */}
            <PertToolbar onExport={handleExport} />

            {/* Container du diagramme avec état de chargement */}
            <div
                id="pert-chart-container"
                className="w-full h-[600px] rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300"
            >
                {isLoading ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-black dark:text-white" role="status">
                            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Chargement...</span>
                        </div>
                    </div>
                ) : pertGraph ? (
                    <ReactFlowProvider>
                        <PertChartInner graph={pertGraph} />
                    </ReactFlowProvider>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Impossible de générer le diagramme PERT</p>
                    </div>
                )}
            </div>

            {/* Légende du diagramme */}
            <div className="flex justify-center gap-6 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-black dark:bg-white"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tâche standard</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-sm bg-black dark:bg-white border-2 border-red-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tâche critique</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Chemin critique</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-gray-400 dark:bg-gray-500"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dépendance</span>
                </div>
            </div>
        </motion.div>
    );
};

export default PertChart;