import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  HomeIcon, 
  StarIcon,
  LogOutIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MenuIcon,
  XIcon,
  Trash2Icon
} from 'lucide-react';
import ThemeToggler from './ThemeToggler';

const Sidebar = ({ 
  username = "User", 
  avatar = null,
  onNavigate,
  activeSection = "all",
  onLogout 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
    { id: 'all', icon: HomeIcon, label: 'All Notes', emoji: '📝' },
    { id: 'starred', icon: StarIcon, label: 'Starred', emoji: '⭐' },
    { id: 'shared', icon: HomeIcon, label: 'Shared', emoji: '👥' },
    { id: 'trash', icon: Trash2Icon, label: 'Trash', emoji: '🗑️' },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const sidebarContent = (
    <motion.div 
      className={`fixed top-16 left-0 h-[calc(100%-4rem)] 
        bg-gradient-to-br from-white/80 via-sky-50/50 to-white/80
        dark:bg-gradient-to-br dark:from-slate-800/90 dark:via-slate-900/50 dark:to-slate-800/90
        backdrop-blur-sm flex flex-col shadow-sm
        ${isExpanded ? 'w-64' : 'w-16'} 
        border-r border-white/20 dark:border-slate-700/30
        transition-all duration-200 ease-in-out
        z-30`}
      initial={false}
      animate={{ width: isExpanded ? 256 : 80 }}
    >
      {/* App Title */}
      <div className="p-4">
        <h1 className={`text-3xl font-black tracking-tight app-title select-none
          ${isExpanded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          Notes App
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md
                transition-all duration-150 ease-in-out group
                ${activeSection === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
            >
              <span className="flex items-center gap-2 min-w-[24px]">
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-base leading-none">{item.emoji}</span>
              </span>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-2 truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-center">
          <ThemeToggler />
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 
            hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg
            transition-colors duration-150 ease-in-out"
        >
          <LogOutIcon className="w-5 h-5" />
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-3"
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2
          w-6 h-6 rounded-full bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700
          flex items-center justify-center
          text-gray-500 dark:text-gray-400
          hover:text-gray-700 dark:hover:text-gray-200
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-colors duration-150 ease-in-out
          hidden md:flex"
      >
        {isExpanded ? <ChevronLeftIcon size={14} /> : <ChevronRightIcon size={14} />}
      </button>
    </motion.div>
  );

  // Mobile menu button
  const mobileButton = (
    <button
      onClick={toggleMobileSidebar}
      className="fixed top-4 left-4 z-50 md:hidden
        w-10 h-10 rounded-lg bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        flex items-center justify-center
        text-gray-500 dark:text-gray-400
        hover:text-gray-700 dark:hover:text-gray-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors duration-150 ease-in-out"
    >
      {isMobileOpen ? (
        <XIcon className="w-5 h-5" />
      ) : (
        <MenuIcon className="w-5 h-5" />
      )}
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      {mobileButton}
    </>
  );
};

export default Sidebar;
