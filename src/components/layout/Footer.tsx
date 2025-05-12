/**
 * Composant Footer
 * Ce composant est le pied de page de l'application
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Footer: React.FC = () => {
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold text-gray-800 dark:text-white">ProjectFlow</span>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0">
                        <p className="text-center md:text-right text-sm text-gray-500 dark:text-gray-400">
                            &copy; {currentYear} ProjectFlow. Tous droits réservés.
                        </p>
                        <p className="text-center md:text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Projet de Recherche Opérationnelle
                        </p>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <nav className="flex space-x-4 mb-4 md:mb-0">
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                                Confidentialité
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                                Conditions
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                                Documentation
                            </a>
                            <a href="#" className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                                Contact
                            </a>
                        </nav>

                        <div className="flex space-x-3">
                            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="GitHub">
                                <svg className="h-4 w-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Twitter">
                                <svg className="h-4 w-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="LinkedIn">
                                <svg className="h-4 w-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Effet subtil au survol */}
                <motion.div
                    className="w-full h-1 mt-6 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent rounded-full"
                    whileHover={{
                        backgroundImage: "linear-gradient(to right, transparent, rgba(0,0,0,1), transparent)",
                        opacity: theme === 'dark' ? 0.2 : 0.1
                    }}
                />
            </div>
        </motion.footer>
    );
};

export default Footer;