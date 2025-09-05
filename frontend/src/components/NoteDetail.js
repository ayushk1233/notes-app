import React from 'react';
import './NoteDetail.css';
import './NoteGlobalStyles.css';

const NoteDetail = ({ note, onEdit, onDelete, onShare, onBack, loading }) => {
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

  if (!note) {
    return (
      <div className="note-detail-container">
        <div className="error-state">
          <h3>Note not found</h3>
          <button onClick={onBack} className="back-button-large">
            ← Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-detail-container">
      <div className="note-detail-header">
        <div className="note-title-section">
          <h1 className="note-title-large">
            {note.title}
            {note.shared && <span className="shared-badge-large">🔗 Shared</span>}
          </h1>
        </div>
        
        <div className="note-actions-toolbar">
          <button
            onClick={onEdit}
            className="toolbar-button edit"
            disabled={loading}
            title="Edit this note"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onShare}
            className="toolbar-button share"
            disabled={loading}
            title="Share this note"
          >
            🔗 Share
          </button>
          <button
            onClick={onDelete}
            className="toolbar-button delete"
            disabled={loading}
            title="Delete this note"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="note-meta-info">
        <div className="meta-item">
          <strong>Created:</strong> {formatDate(note.created_at)}
        </div>
        {note.updated_at !== note.created_at && (
          <div className="meta-item">
            <strong>Last Updated:</strong> {formatDate(note.updated_at)}
          </div>
        )}
      </div>

      <div className="note-content-detail">
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

      {note.is_shared && note.share_token && (
        <div className="shared-info">
          <h4>🔗 This note is shared</h4>
          <p>This note is publicly accessible via this share link:</p>
          <div className="share-url-container">
            <input
              type="text"
              readOnly
              value={`${process.env.REACT_APP_URL || 'http://localhost:3000'}/shared/${note.share_token}`}
              className="share-url-input"
            />
            <button
              onClick={() => {
                const url = `${process.env.REACT_APP_URL || 'http://localhost:3000'}/shared/${note.share_token}`;
                navigator.clipboard.writeText(url);
                alert('Share URL copied to clipboard!');
              }}
              className="copy-button"
            >
              📋 Copy
            </button>
          </div>
        </div>
      )}

      <div className="note-stats">
        <div className="stat-item">
          <strong>Characters:</strong> {note.content?.length || 0}
        </div>
        <div className="stat-item">
          <strong>Words:</strong> {note.content ? note.content.split(/\s+/).filter(word => word.length > 0).length : 0}
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;