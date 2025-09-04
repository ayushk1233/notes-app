import React, { useState, useEffect } from 'react';
import notesApi from '../services/api';
import './SharedNote.css';

const SharedNote = ({ note: initialNote, onBack }) => {
  const [note, setNote] = useState(initialNote || null);
  const [loading, setLoading] = useState(!initialNote);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadSharedNote = async (shareToken) => {
    setLoading(true);
    setError(null);
    
    try {
      const sharedNote = await notesApi.getSharedNote(shareToken);
      setNote(sharedNote);
    } catch (error) {
      console.error('Error loading shared note:', error);
      if (error.response && error.response.status === 404) {
        setError('This shared note was not found or is no longer available.');
      } else {
        setError('Failed to load shared note. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/shared/')) {
      const shareToken = path.split('/shared/')[1];
      loadSharedNote(shareToken);
    }
  }, []);

  if (loading) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-loading">
          <h2>Loading shared note...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-error">
          <h2>⚠️ {error}</h2>
          <button onClick={() => window.location.href = '/'} className="back-to-home">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-error">
          <h2>Note not found</h2>
          <button onClick={() => window.location.href = '/'} className="back-to-home">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-note-container">
      <div className="shared-note-header">
        <h1>{note.title}</h1>
        <div className="shared-meta">
          <span>Shared note</span>
          <span>Created: {formatDate(note.created_at)}</span>
        </div>
      </div>

      <div className="shared-note-content">
        {note.content ? (
          <div className="content-text">
            {note.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="no-content">
            <p>This note has no content.</p>
          </div>
        )}
      </div>

      <div className="shared-note-footer">
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
      </div>
    </div>
  );
};

export default SharedNote;
