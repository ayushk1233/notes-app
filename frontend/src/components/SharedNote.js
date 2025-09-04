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
      const shareToken = path.split('/shared/')[1].split('?')[0]; // Remove any query parameters
      loadSharedNote(shareToken);
    } else {
      // Try to get token from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        loadSharedNote(token);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading shared note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-error">
          <h3>❌ Unable to Load Note</h3>
          <p>{error}</p>
          <button onClick={onBack} className="back-button-large">
            ← Back to Notes
          </button>
          <button onClick={() => loadSharedNote()} className="retry-button">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="shared-note-container">
        <div className="shared-note-error">
          <h3>Note Not Found</h3>
          <p>The shared note you're looking for doesn't exist or is no longer shared.</p>
          <button onClick={onBack} className="back-button-large">
            ← Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-note-container">
      <div className="shared-note-header">
        <div className="shared-badge-header">
          🔗 Shared Note
        </div>
        <h1 className="shared-note-title">{note.title}</h1>
      </div>

      <div className="shared-note-meta">
        <div className="meta-row">
          <span className="meta-label">Created:</span>
          <span className="meta-value">{formatDate(note.created_at)}</span>
        </div>
        {note.updated_at !== note.created_at && (
          <div className="meta-row">
            <span className="meta-label">Last Updated:</span>
            <span className="meta-value">{formatDate(note.updated_at)}</span>
          </div>
        )}
      </div>

      <div className="shared-note-content">
        {note.content ? (
          <div className="content-text">
            {note.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph || '\u00A0'}</p>
            ))}
          </div>
        ) : (
          <div className="no-content">
            <p><em>This note has no content.</em></p>
          </div>
        )}
      </div>

      <div className="shared-note-footer">
        <div className="note-info">
          <p>This is a shared note. You can view it but not edit it.</p>
        </div>
        
        <div className="shared-note-stats">
          <span className="stat">
            📝 {note.content ? note.content.split(/\s+/).filter(word => word.length > 0).length : 0} words
          </span>
          <span className="stat">
            🔤 {note.content?.length || 0} characters
          </span>
        </div>

        {onBack && (
          <button onClick={onBack} className="back-to-app-button">
            ← Back to My Notes
          </button>
        )}
      </div>
    </div>
  );
};

export default SharedNote;
