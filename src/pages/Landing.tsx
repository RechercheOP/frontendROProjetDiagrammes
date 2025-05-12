/**
 * Page d'accueil (Landing)
 * Cette page est la première vue que les utilisateurs voient en visitant l'application
 * Elle présente le projet avec un style moderne et épuré
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Landing: React.FC = () => {
    const { theme } = useTheme();
    const [scrollPosition, setScrollPosition] = useState(0);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const ctaRef = useRef(null);

    const isHeroInView = useInView(heroRef, { once: true });
    const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });
    const isCtaInView = useInView(ctaRef, { once: true, margin: "-100px" });

    const heroControls = useAnimation();
    const featuresControls = useAnimation();
    const ctaControls = useAnimation();

    // Suivre la position de défilement pour les animations basées sur le scroll
    useEffect(() => {
        const handleScroll = () => {
            const position = window.pageYOffset;
            setScrollPosition(position);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Déclencher les animations quand les sections entrent dans la vue
    useEffect(() => {
        if (isHeroInView) {
            heroControls.start('visible');
        }
        if (isFeaturesInView) {
            featuresControls.start('visible');
        }
        if (isCtaInView) {
            ctaControls.start('visible');
        }
    }, [isHeroInView, isFeaturesInView, isCtaInView, heroControls, featuresControls, ctaControls]);

    const heroVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    const featureVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            }
        }
    };

    const featureItemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const ctaVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="overflow-hidden">
            {/* Section Héro avec animation de parallaxe */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
                style={{
                    transform: `translateY(${scrollPosition * 0.2}px)`,
                    opacity: 1 - (scrollPosition * 0.001)
                }}
            >
                {/* Éléments de background abstraits */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-gray-200 to-transparent dark:from-gray-800 rounded-full opacity-30 blur-3xl"></div>
                    <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gradient-to-bl from-gray-300 to-transparent dark:from-gray-700 rounded-full opacity-30 blur-3xl"></div>
                    <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-tr from-gray-200 to-transparent dark:from-gray-800 rounded-full opacity-20 blur-3xl"></div>

                    {/* Grille de points décoratifs */}
                    <div className="absolute inset-0 grid grid-cols-12 gap-4 pointer-events-none opacity-10 dark:opacity-5">
                        {Array.from({ length: 180 }).map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
                        ))}
                    </div>
                </div>

                {/* Contenu du héro */}
                <motion.div
                    className="max-w-4xl mx-auto text-center z-10"
                    variants={heroVariants}
                    initial="hidden"
                    animate={heroControls}
                >
                    <motion.div
                        className="inline-block mb-4"
                        variants={itemVariants}
                    >
            <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-full">
              Recherche Opérationnelle
            </span>
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
                        variants={itemVariants}
                    >
                        <span className="block">Visualisez vos</span>
                        <span className="block mt-2">
              <span className="relative inline-block">
                <span className="relative z-10">projets</span>
                <span className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 opacity-20 rounded"></span>
              </span>
              <span> avec précision</span>
            </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto"
                        variants={itemVariants}
                    >
                        Créez des diagrammes de Gantt et PERT interactifs pour analyser et optimiser vos projets avec une interface moderne et intuitive.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row justify-center gap-4"
                        variants={itemVariants}
                    >
                        <Link to="/dashboard">
                            <motion.button
                                className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black font-medium rounded-xl hover:shadow-lg transform transition-all hover:-translate-y-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Commencer
                            </motion.button>
                        </Link>

                        <Link to="/dashboard">
                            <motion.button
                                className="px-8 py-4 bg-transparent border border-black text-black dark:border-white dark:text-white font-medium rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transform transition-all hover:-translate-y-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Découvrir
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Indicateur de défilement */}
                    <motion.div
                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        variants={itemVariants}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">Défiler</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Section des fonctionnalités */}
            <section
                ref={featuresRef}
                className="py-24 px-4 bg-white dark:bg-gray-900"
            >
                <motion.div
                    className="max-w-7xl mx-auto"
                    variants={featureVariants}
                    initial="hidden"
                    animate={featuresControls}
                >
                    <motion.div
                        className="text-center mb-16"
                        variants={featureItemVariants}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Visualisez votre planification de projet
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Des outils puissants pour la gestion de projet, conçus pour la recherche opérationnelle et l'optimisation.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* Feature 1: Diagramme de Gantt */}
                        <motion.div
                            className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-8 hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                            variants={featureItemVariants}
                        >
                            <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Diagrammes de Gantt
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Créez des diagrammes de Gantt interactifs avec des dépendances de tâches, des durées et des jalons. Visualisez votre chronologie avec précision.
                            </p>
                            <div className="mt-auto">
                                <Link to="/dashboard" className="text-black dark:text-white font-medium flex items-center hover:underline">
                                    <span>En savoir plus</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Feature 2: Diagramme PERT */}
                        <motion.div
                            className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-8 hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                            variants={featureItemVariants}
                        >
                            <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Réseaux PERT
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Concevez des réseaux PERT complexes avec des nœuds et des flèches. Calculez automatiquement les chemins critiques et les marges.
                            </p>
                            <div className="mt-auto">
                                <Link to="/dashboard" className="text-black dark:text-white font-medium flex items-center hover:underline">
                                    <span>En savoir plus</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Feature 3: Chemin critique */}
                        <motion.div
                            className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-8 hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                            variants={featureItemVariants}
                        >
                            <div className="w-14 h-14 bg-black dark:bg-white rounded-2xl flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                Analyse du chemin critique
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Identifiez et mettez en évidence automatiquement les chemins critiques dans vos projets. Optimisez votre calendrier pour une efficacité maximale.
                            </p>
                            <div className="mt-auto">
                                <Link to="/dashboard" className="text-black dark:text-white font-medium flex items-center hover:underline">
                                    <span>En savoir plus</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Aperçu des diagrammes */}
                    <motion.div
                        className="mt-24 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 md:p-10 relative overflow-hidden"
                        variants={featureItemVariants}
                    >
                        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Interface utilisateur moderne et intuitive
                            </h3>

                            <div className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden relative">
                                {/* Mockup d'interface */}
                                <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 flex items-center px-4">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col h-[calc(400px-2.5rem)]">
                                    <div className="flex mb-4">
                                        <div className="w-1/4 bg-gray-100 dark:bg-gray-800 h-10 rounded-lg"></div>
                                        <div className="w-2/4 mx-auto flex space-x-2">
                                            <div className="w-20 bg-gray-100 dark:bg-gray-800 h-10 rounded-lg"></div>
                                            <div className="w-20 bg-gray-100 dark:bg-gray-800 h-10 rounded-lg"></div>
                                            <div className="w-20 bg-gray-100 dark:bg-gray-800 h-10 rounded-lg"></div>
                                        </div>
                                        <div className="w-1/4 bg-gray-100 dark:bg-gray-800 h-10 rounded-lg ml-auto"></div>
                                    </div>

                                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex overflow-hidden">
                                        <div className="w-1/4 space-y-3">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="bg-gray-100 dark:bg-gray-800 h-8 rounded-lg"></div>
                                            ))}
                                        </div>
                                        <div className="flex-1 ml-4">
                                            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg relative">
                                                <div className="absolute top-6 left-12 w-48 h-8 bg-black dark:bg-white rounded-lg"></div>
                                                <div className="absolute top-20 left-12 w-64 h-8 bg-black dark:bg-white rounded-lg"></div>
                                                <div className="absolute top-34 left-12 w-40 h-8 bg-black dark:bg-white rounded-lg"></div>
                                                <div className="absolute top-48 left-12 w-72 h-8 bg-black dark:bg-white rounded-lg"></div>
                                                <div className="absolute top-62 left-12 w-56 h-8 bg-black dark:bg-white rounded-lg"></div>

                                                <div className="absolute top-6 right-12 h-64 w-1 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="absolute top-20 right-12 h-1 w-8 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="absolute top-34 right-12 h-1 w-16 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="absolute top-48 right-12 h-1 w-10 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="absolute top-62 right-12 h-1 w-12 bg-gray-200 dark:bg-gray-700"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Section CTA */}
            <section
                ref={ctaRef}
                className="py-24 px-4 relative overflow-hidden"
            >
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"></div>
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.2, 0.25, 0.2]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 5,
                            ease: "easeInOut"
                        }}
                        style={{
                            background: theme === 'dark'
                                ? 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)'
                                : 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)'
                        }}
                    />
                </div>

                <motion.div
                    className="max-w-5xl mx-auto relative z-10"
                    variants={ctaVariants}
                    initial="hidden"
                    animate={ctaControls}
                >
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Prêt à optimiser vos projets?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
                            Commencez dès maintenant à créer des diagrammes de Gantt et PERT avec notre interface intuitive.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/dashboard">
                                <motion.button
                                    className="px-10 py-4 bg-black text-white dark:bg-white dark:text-black font-medium rounded-xl text-lg hover:shadow-lg transform transition-all hover:-translate-y-1"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Commencer
                                </motion.button>
                            </Link>
                        </div>

                        <motion.div
                            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.2,
                                    }
                                }
                            }}
                        >
                            <motion.div
                                className="p-6"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                }}
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Facile à utiliser</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Interface intuitive conçue pour une expérience utilisateur optimale.
                                </p>
                            </motion.div>

                            <motion.div
                                className="p-6"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                }}
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Exportation facile</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Exportez vos diagrammes en plusieurs formats pour les partager.
                                </p>
                            </motion.div>

                            <motion.div
                                className="p-6"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                }}
                            >
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Optimisé pour l'éducation</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Parfait pour les projets de recherche opérationnelle et l'enseignement.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Landing;