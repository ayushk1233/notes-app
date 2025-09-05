import React from 'react';
import { SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggler = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-full 
        transition-all duration-500 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 
        ${isDark 
          ? 'bg-gradient-to-r from-[#00c6ff] to-[#0072ff] focus:ring-blue-500 hover:shadow-[0_0_15px_rgba(0,198,255,0.5)]' 
          : 'bg-gradient-to-r from-[#6a11cb] to-[#2575fc] focus:ring-purple-500 hover:shadow-[0_0_15px_rgba(106,17,203,0.5)]'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode 🌞' : 'Switch to dark mode 🌙'}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 180 : 0,
          scale: 1
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isDark ? (
          <SunIcon className="w-5 h-5 text-white" />
        ) : (
          <MoonIcon className="w-5 h-5 text-white" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggler;
