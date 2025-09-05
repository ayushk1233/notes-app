import React from 'react';
import Masonry from 'react-masonry-css';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';
import './MasonryNotesGrid.css';

const MasonryNotesGrid = ({ 
  notes = [], 
  onViewNote,
  onEditNote,
  onDeleteNote,
  onShareNote 
}) => {
  const breakpointCols = {
    default: 4,    // Default number of columns
    1920: 5,       // Extra large screens
    1536: 4,       // Large desktop
    1280: 3,       // Small desktop
    1024: 3,       // Laptop
    768: 2,        // Tablet
    640: 2,        // Large mobile
    480: 1         // Mobile
  };
  // Empty state
  if (!notes.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes</h3>
          <p className="text-gray-500">Get started by creating a new note.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-grid-container">
      <AnimatePresence>
        <Masonry
          breakpointCols={breakpointCols}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout="position"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                opacity: { duration: 0.2 },
                layout: { duration: 0.2 }
              }}
            >
              <NoteCard
                title={note.title}
                content={note.content}
                tags={note.tags || []}
                backgroundColor={note.backgroundColor}
                onView={() => onViewNote(note)}
                onEdit={() => onEditNote(note)}
                onDelete={() => onDeleteNote(note)}
                onShare={() => onShareNote(note)}
              />
            </motion.div>
          ))}
        </Masonry>
      </AnimatePresence>
    </div>
  );
};

export default MasonryNotesGrid;
