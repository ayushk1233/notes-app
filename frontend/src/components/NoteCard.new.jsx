import React from 'react';
import { motion } from 'framer-motion';

// Helper function to determine if a color is light or dark
const isLightColor = (color) => {
  // Default to true if no color is provided (will use light theme)
  if (!color) return true;

  // For predefined colors using Tailwind classes
  if (color.startsWith('bg-')) {
    const colorMap = {
      'bg-red-100': true,
      'bg-pink-100': true,
      'bg-orange-100': true,
      'bg-yellow-100': true,
      'bg-green-100': true,
      'bg-teal-100': true,
      'bg-blue-100': true,
      'bg-indigo-100': true,
      'bg-purple-100': true,
      'bg-red-200': true,
      'bg-pink-200': true,
      'bg-orange-200': true,
      'bg-yellow-200': true,
      'bg-green-200': true,
      'bg-teal-200': true,
      'bg-blue-200': true,
      'bg-indigo-200': true,
      'bg-purple-200': true,
      // Add darker variants as false
      'bg-red-500': false,
      'bg-pink-500': false,
      'bg-orange-500': false,
      'bg-yellow-500': false,
      'bg-green-500': false,
      'bg-teal-500': false,
      'bg-blue-500': false,
      'bg-indigo-500': false,
      'bg-purple-500': false,
    };
    return colorMap[color] ?? true;
  }

  // For hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }

  return true;
};
