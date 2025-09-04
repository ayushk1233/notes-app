import React from 'react';
import './NotesList.css';

const NotesList = ({ 
  notes, 
  onCreateNew, 
  onViewNote, 
  onEditNote, 
  onDeleteNote, 
  onShareNote, 
  loading 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return 'No content';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading && notes.length === 0) {
    return (
      <div className="notes-container">
        <div className="loading">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2>Your Notes ({notes.length})</h2>
        <button 
          className="create-button"
          onClick={onCreateNew}
          disabled={loading}
        >
          + Create New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <h3>📝 No notes yet!</h3>
          <p>Create your first note to get started.</p>
          <button 
            className="create-button-large"
            onClick={onCreateNew}
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3 
                  className="note-title"
                  onClick={() => onViewNote(note)}
                >
                  {note.title}
                  {note.shared && <span className="shared-badge">🔗 Shared</span>}
                </h3>
              </div>
              
              <div className="note-content">
                <p>{truncateContent(note.content)}</p>
              </div>
              
              <div className="note-meta">
                <span className="note-date">
                  {formatDate(note.created_at)}
                </span>
                {note.updated_at !== note.created_at && (
                  <span className="note-updated">
                    (Updated: {formatDate(note.updated_at)})
                  </span>
                )}
              </div>
              
              <div className="note-actions">
                <button 
                  className="action-button view"
                  onClick={() => onViewNote(note)}
                  title="View note"
                >
                  👁️ View
                </button>
                <button 
                  className="action-button edit"
                  onClick={() => onEditNote(note)}
                  title="Edit note"
                >
                  ✏️ Edit
                </button>
                <button 
                  className="action-button share"
                  onClick={() => onShareNote(note.id)}
                  title="Share note"
                  disabled={loading}
                >
                  🔗 Share
                </button>
                <button 
                  className="action-button delete"
                  onClick={() => onDeleteNote(note.id)}
                  title="Delete note"
                  disabled={loading}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesList;