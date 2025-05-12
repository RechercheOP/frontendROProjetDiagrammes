/**
 * Page 404 (Not Found)
 * Cette page est affichée lorsqu'une route demandée n'existe pas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64 text-gray-900 dark:text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <h1 className="text-9xl font-extrabold text-black dark:text-white tracking-widest">
                            404
                        </h1>
                        <div className="absolute top-[70px] -rotate-12 p-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded">
                            Page introuvable
                        </div>
                    </div>
                </div>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
                    La page que vous recherchez semble avoir disparu dans l'espace de données.
                </p>

                <Link to="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-medium rounded-xl hover:shadow-lg transition-all"
                    >
                        Retour à l'accueil
                    </motion.button>
                </Link>

                <div className="mt-8 text-gray-500 dark:text-gray-400 text-sm">
                    <p>Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à contacter l'assistance.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;