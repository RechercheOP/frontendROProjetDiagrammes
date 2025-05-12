/**
 * Composant pour l'affichage de la timeline du diagramme de Gantt
 * Ce composant gère l'axe temporel du diagramme
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, addDays, addWeeks, addMonths, isEqual, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GanttTimelineProps {
    startDate: Date;
    endDate: Date;
    viewMode: 'day' | 'week' | 'month';
    onZoom?: (zoomIn: boolean) => void;
    onScroll?: (position: number) => void;
}

const GanttTimeline: React.FC<GanttTimelineProps> = ({
                                                         startDate,
                                                         endDate,
                                                         viewMode = 'day',
                                                         onZoom,
                                                         onScroll
                                                     }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const today = new Date();

    // Générer les intervalles de temps en fonction du mode d'affichage
    const getTimeIntervals = () => {
        switch(viewMode) {
            case 'day':
                return eachDayOfInterval({ start: startDate, end: endDate });
            case 'week':
                const weeks = [];
                let currentDate = startOfWeek(startDate, { locale: fr });
                while (currentDate <= endDate) {
                    weeks.push(currentDate);
                    currentDate = addWeeks(currentDate, 1);
                }
                return weeks;
            case 'month':
                const months = [];
                let currentMonth = startOfMonth(startDate);
                while (currentMonth <= endDate) {
                    months.push(currentMonth);
                    currentMonth = addMonths(currentMonth, 1);
                }
                return months;
            default:
                return eachDayOfInterval({ start: startDate, end: endDate });
        }
    };

    const timeIntervals = getTimeIntervals();

    // Formater l'affichage de la date en fonction du mode
    const formatInterval = (date: Date) => {
        switch(viewMode) {
            case 'day':
                return format(date, 'dd MMM', { locale: fr });
            case 'week':
                const weekEnd = endOfWeek(date, { locale: fr });
                return `${format(date, 'dd MMM', { locale: fr })} - ${format(weekEnd, 'dd MMM', { locale: fr })}`;
            case 'month':
                return format(date, 'MMMM yyyy', { locale: fr });
            default:
                return format(date, 'dd/MM/yyyy', { locale: fr });
        }
    };

    // Calculer la largeur d'un intervalle
    const getIntervalWidth = () => {
        switch(viewMode) {
            case 'day':
                return 60; // 60px par jour
            case 'week':
                return 140; // 140px par semaine
            case 'month':
                return 200; // 200px par mois
            default:
                return 60;
        }
    };

    const intervalWidth = getIntervalWidth();

    // Gérer le défilement
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const position = e.currentTarget.scrollLeft;
        setScrollPosition(position);
        if (onScroll) {
            onScroll(position);
        }
    };

    // Effets pour le défilement
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        // Défiler jusqu'à aujourd'hui lors du montage
        if (scrollContainer) {
            const todayIndex = timeIntervals.findIndex(date =>
                viewMode === 'day'
                    ? isEqual(date, today)
                    : viewMode === 'week'
                        ? date <= today && addWeeks(date, 1) > today
                        : date <= today && addMonths(date, 1) > today
            );

            if (todayIndex !== -1) {
                setTimeout(() => {
                    scrollContainer.scrollLeft = todayIndex * intervalWidth - (scrollContainer.clientWidth / 2) + (intervalWidth / 2);
                }, 300);
            }
        }
    }, [timeIntervals, intervalWidth, today, viewMode]);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {format(startDate, 'dd MMMM yyyy', { locale: fr })} - {format(endDate, 'dd MMMM yyyy', { locale: fr })}
                </div>
                <div className="flex space-x-2">
                    {onZoom && (
                        <>
                            <button
                                onClick={() => onZoom(true)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Zoom in"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onZoom(false)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Zoom out"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="timeline-container overflow-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                style={{
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    userSelect: 'none'
                }}
            >
                <div
                    className="timeline"
                    style={{
                        display: 'flex',
                        width: `${timeIntervals.length * intervalWidth}px`,
                        height: '60px',
                        position: 'relative'
                    }}
                >
                    {timeIntervals.map((date, index) => {
                        const isToday = viewMode === 'day'
                            ? isEqual(new Date(date.setHours(0,0,0,0)), new Date(today.setHours(0,0,0,0)))
                            : viewMode === 'week'
                                ? date <= today && addWeeks(date, 1) > today
                                : date <= today && addMonths(date, 1) > today;

                        return (
                            <div
                                key={index}
                                className={`transition-colors duration-300 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-center items-center ${
                                    isToday
                                        ? 'bg-gray-100 dark:bg-gray-800'
                                        : 'bg-white dark:bg-gray-900'
                                }`}
                                style={{
                                    width: `${intervalWidth}px`,
                                    height: '100%'
                                }}
                            >
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {formatInterval(date)}
                                </div>

                                {isToday && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mt-1 w-2 h-2 rounded-full bg-black dark:bg-white"
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Indicateur de position actuelle */}
                    {viewMode === 'day' && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: '100%', opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute top-0 w-0.5 bg-black dark:bg-white"
                            style={{
                                left: `${(today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) * intervalWidth}px`,
                                zIndex: 10
                            }}
                        >
                            <div className="absolute -top-1 -ml-1.5 w-3 h-3 rounded-full bg-black dark:bg-white" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Indicateur de défilement */}
            <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-black dark:bg-white rounded-full"
                    style={{
                        width: scrollContainerRef.current
                            ? `${(scrollContainerRef.current.clientWidth / (timeIntervals.length * intervalWidth)) * 100}%`
                            : '10%',
                        transformOrigin: 'left',
                        x: scrollContainerRef.current && timeIntervals.length * intervalWidth > 0
                            ? `${scrollPosition / (timeIntervals.length * intervalWidth - scrollContainerRef.current.clientWidth) * 100}%`
                            : 0
                    }}
                />
            </div>
        </div>
    );
};

export default GanttTimeline;