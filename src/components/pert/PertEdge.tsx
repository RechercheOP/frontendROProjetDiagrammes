/**
 * Composant pour une arête dans le diagramme PERT
 * Ce composant définit l'apparence et le comportement d'une arête entre deux nœuds
 */

import React, { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useTheme } from '../../contexts/ThemeContext';

const PertEdge: React.FC<EdgeProps> = ({
                                           id,
                                           sourceX,
                                           sourceY,
                                           targetX,
                                           targetY,
                                           sourcePosition,
                                           targetPosition,
                                           style = {},
                                           animated = false,
                                           label,
                                           markerEnd,
                                           data
                                       }) => {
    const { theme } = useTheme();

    // Calculer le chemin de la courbe
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Styles en fonction du thème et des propriétés
    const isCritical = style?.stroke === '#ff4d4f';
    const edgeColor = isCritical
        ? '#ff4d4f'
        : theme === 'dark'
            ? '#9ca3af'
            : '#6b7280';

    const edgeWidth = isCritical ? 2 : 1.5;
    const edgeOpacity = isCritical ? 1 : 0.8;

    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: edgeColor,
                    strokeWidth: edgeWidth,
                    opacity: edgeOpacity,
                    transition: 'stroke 0.3s, stroke-width 0.3s, opacity 0.3s',
                }}
                strokeDasharray={animated ? '5,5' : undefined}
                animated={animated ? true : undefined}
            />

            {/* Si l'arête est animée (chemin critique), ajouter un effet de lueur */}
            {animated && (
                <path
                    d={edgePath}
                    style={{
                        stroke: '#ff4d4f',
                        strokeWidth: 4,
                        opacity: 0.2,
                        filter: 'blur(4px)',
                    }}
                    className="react-flow__edge-path-glow"
                />
            )}

            {/* Rendu de l'étiquette si présente */}
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                            background: theme === 'dark' ? '#1f2937' : '#ffffff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 500,
                            color: theme === 'dark' ? '#ffffff' : '#000000',
                            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
};

export default memo(PertEdge);