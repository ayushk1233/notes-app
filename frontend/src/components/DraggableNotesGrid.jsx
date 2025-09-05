import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';

const DraggableNotesGrid = ({ 
  notes = [], 
  onReorder,
  onViewNote,
  onEditNote,
  onDeleteNote,
  onShareNote 
}) => {
  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    onReorder(items);
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="notes" direction="vertical">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
          >
            <AnimatePresence>
              {notes.map((note, index) => (
                <Draggable 
                  key={note.id} 
                  draggableId={note.id.toString()} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      style={provided.draggableProps.style}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className={`relative ${
                          snapshot.isDragging ? 'z-50' : ''
                        }`}
                      >
                        <NoteCard
                          title={note.title}
                          content={note.content}
                          tags={note.tags || []}
                          onView={() => onViewNote(note)}
                          onEdit={() => onEditNote(note)}
                          onDelete={() => onDeleteNote(note)}
                          onShare={() => onShareNote(note)}
                        />
                      </div>
                    </motion.div>
                  )}
                </Draggable>
              ))}
            </AnimatePresence>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableNotesGrid;
