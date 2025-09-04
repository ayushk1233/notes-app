import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import NotesList from './components/NotesList';
import NoteForm from './components/NoteForm';
import NoteDetail from './components/NoteDetail';
import SharedNote from './components/SharedNote';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import notesApi from './services/api';

function App() {
  const [notes, setNotes] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'detail', 'shared'
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  // Function to load all notes
  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedNotes = await notesApi.getAllNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      setError('Failed to load notes');
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to handle guest login
  const handleGuestLogin = async () => {
    try {
      await notesApi.auth.guestLogin();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to login as guest:', error);
      setError('Failed to access as guest. Please try again.');
    }
  };

  // Check authentication status and handle shared note routes on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isSharedNotePath = window.location.pathname.startsWith('/shared/');
    
    if (token) {
      setIsAuthenticated(true);
    } else if (isSharedNotePath) {
      // For shared notes, attempt guest login if not authenticated
      handleGuestLogin();
    } else {
      setIsAuthenticated(false);
    }

    // Handle shared note URL
    if (isSharedNotePath) {
      const shareToken = window.location.pathname.split('/shared/')[1];
      setSelectedNote({ shareToken });
      setCurrentView('shared');
    }
  }, []);

  // Load notes when authenticated
  useEffect(() => {
    if (isAuthenticated && currentView !== 'shared') {
      loadNotes();
    }
  }, [isAuthenticated, currentView, loadNotes]);

  // Function to create a new note
  const createNote = async (noteData) => {
    setLoading(true);
    setError(null);
    try {
      const newNote = await notesApi.createNote(noteData);
      setNotes([newNote, ...notes]);
      setCurrentView('list');
      return newNote;
    } catch (error) {
      setError('Failed to create note');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to update a note
  const updateNote = async (noteId, noteData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await notesApi.updateNote(noteId, noteData);
      setNotes(notes.map(note => 
        note.id === noteId ? updatedNote : note
      ));
      setCurrentView('list');
      return updatedNote;
    } catch (error) {
      setError('Failed to update note');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a note
  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await notesApi.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      setCurrentView('list');
    } catch (error) {
      setError('Failed to delete note');
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to share a note
  const shareNote = async (noteId) => {
    setLoading(true);
    setError(null);
    try {
      const shareData = await notesApi.shareNote(noteId);
      // Update the note in the list to reflect shared status
      setNotes(notes.map(note => 
        note.id === noteId ? {...note, is_shared: true, share_token: shareData.share_token} : note
      ));
      
      // Show share URL in a more user-friendly way
      const shareUrl = shareData.share_url;
      window.prompt(
        'Your note has been shared! Copy the link below:',
        shareUrl
      );
      
      return shareData;
    } catch (error) {
      setError('Failed to share note');
      console.error('Error sharing note:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const showCreateForm = () => {
    setSelectedNote(null);
    setCurrentView('create');
  };

  const showEditForm = (note) => {
    setSelectedNote(note);
    setCurrentView('edit');
  };

  const showNoteDetail = (note) => {
    setSelectedNote(note);
    setCurrentView('detail');
  };

  const showNotesList = () => {
    setSelectedNote(null);
    setCurrentView('list');
  };

  // Uncomment this if you need to navigate to shared notes from within the app
  // const showSharedNote = (noteId) => {
  //   setSelectedNote({ id: noteId });
  //   setCurrentView('shared');
  // };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <NoteForm
            onSubmit={createNote}
            onCancel={showNotesList}
            loading={loading}
          />
        );
      case 'edit':
        return (
          <NoteForm
            note={selectedNote}
            onSubmit={(data) => updateNote(selectedNote.id, data)}
            onCancel={showNotesList}
            loading={loading}
            isEditing={true}
          />
        );
      case 'detail':
        return (
          <NoteDetail
            note={selectedNote}
            onEdit={() => showEditForm(selectedNote)}
            onDelete={() => deleteNote(selectedNote.id)}
            onShare={() => shareNote(selectedNote.id)}
            onBack={showNotesList}
            loading={loading}
          />
        );
      case 'shared':
        return (
          <SharedNote
            note={selectedNote}
            onBack={() => {
              // If user is authenticated, go back to notes list
              if (isAuthenticated) {
                showNotesList();
              } else {
                // Otherwise, go to login
                setAuthView('login');
                setCurrentView('list');
              }
            }}
          />
        );
      default:
        return (
          <NotesList
            notes={notes}
            onCreateNew={showCreateForm}
            onViewNote={showNoteDetail}
            onEditNote={showEditForm}
            onDeleteNote={deleteNote}
            onShareNote={shareNote}
            loading={loading}
          />
        );
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    notesApi.auth.logout();
    setIsAuthenticated(false);
    setNotes([]);
    setCurrentView('list');
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
  };

  const handleSwitchToSignup = () => {
    setAuthView('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthView('login');
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        {authView === 'login' ? (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={handleSwitchToSignup}
          />
        ) : (
          <Signup
            onSignup={handleSignup}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>📝 My Notes App</h1>
        <div className="header-actions">
          {currentView !== 'list' && (
            <button 
              className="back-button"
              onClick={showNotesList}
            >
              ← Back to Notes
            </button>
          )}
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;