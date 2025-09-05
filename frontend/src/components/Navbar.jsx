import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  User
} from 'lucide-react';

const Navbar = ({ 
  onSearch, 
  onAddNote, 
  onLogout, 
  username = 'User',
  avatar = null
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle click outside of search and dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const dropdownItems = [
    { icon: User, label: 'Profile', action: () => console.log('Profile clicked') },
    { icon: Settings, label: 'Settings', action: () => console.log('Settings clicked') },
    { icon: LogOut, label: 'Logout', action: onLogout, className: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' }
  ];

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-white/90 via-blue-50/50 to-white/90 dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-indigo-900/30 dark:to-slate-900/95 backdrop-blur-md shadow-sm z-50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/App Name */}
          <div className="flex-shrink-0 flex items-center py-2">
            <h1 className="text-4xl font-black tracking-tight app-title select-none">
              Notes App
            </h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <div 
              ref={searchRef}
              className="relative"
            >
              <motion.div
                animate={{
                  width: isSearchExpanded ? '100%' : '240px'
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchValue}
                  onChange={handleSearch}
                  onFocus={() => setIsSearchExpanded(true)}
                  className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg
                    bg-white/50 dark:bg-gray-700 focus:bg-white/80 dark:focus:bg-gray-600
                    text-gray-900 dark:text-white focus:border-white/20 dark:focus:border-gray-500
                    focus:ring-0 transition-all duration-200 backdrop-blur-sm"
                />
                <Search 
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  strokeWidth={2}
                />
              </motion.div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg 
                hover:bg-gray-100 transition-colors duration-200"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Add Note Button */}
            <button
              onClick={onAddNote}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg 
                hover:bg-gray-100 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg
                  hover:bg-gray-100 transition-colors duration-200"
              >
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt={username}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1
                      border border-gray-200 focus:outline-none"
                  >
                    {dropdownItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            item.action();
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-2 text-sm
                            hover:bg-gray-50 transition-colors duration-150
                            ${item.className || 'text-gray-700 hover:text-gray-900'}`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden pb-4"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchValue}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-transparent rounded-lg
                    bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600
                    text-gray-900 dark:text-white focus:border-gray-300 dark:focus:border-gray-500
                    focus:ring-0 transition-all duration-200"
                  autoFocus
                />
                <Search 
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  strokeWidth={2}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
