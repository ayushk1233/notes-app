import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const SearchBar = ({ onSearch, placeholder = 'Search notes...' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onSearch(value);
        }, 300);
      };
    })(),
    [onSearch]
  );

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div
        className={`relative flex items-center bg-white rounded-lg shadow-sm
          ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-1 ring-gray-200'}
          transition-all duration-200 ease-in-out`}
      >
        {/* Search Icon */}
        <svg
          className="h-5 w-5 text-gray-400 ml-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Search Input */}
        <input
          type="text"
          className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none bg-transparent"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="Search"
        />

        {/* Clear Button */}
        {searchTerm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="p-2 hover:bg-gray-100 rounded-full mr-2 transition-colors duration-200"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
