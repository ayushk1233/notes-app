import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import MasonryNotesGrid from './components/MasonryNotesGrid';
import NoteForm from './components/NoteForm';
import NoteDetail from './components/NoteDetail';
import SharedNote from './components/SharedNote';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import SkeletonNoteCard from './components/SkeletonNoteCard';
import Fab from './components/Fab';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import notesApi from './services/api';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [notes, setNotes] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit', 'detail', 'shared'
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [activeSection, setActiveSection] = useState('all');

  // Function to share a note
  const handleShareNote = async (note) => {
    try {
      const response = await notesApi.shareNote(note.id);
      alert(`Note shared successfully! Share token: ${response.share_token}`);
    } catch (error) {
      setError('Failed to share note');
      console.error('Error sharing note:', error);
    }
  };

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
    const urlParams = new URLSearchParams(window.location.search);
    const shareToken = urlParams.get('token');
    
    if (token) {
      setIsAuthenticated(true);
    } else if (isSharedNotePath || shareToken) {
      // For shared notes, attempt guest login if not authenticated
      handleGuestLogin();
      if (shareToken) {
        setCurrentView('shared');
      }
    } else {
      setIsAuthenticated(false);
    }

    // Handle shared note URL and set view accordingly
    if (isSharedNotePath || shareToken) {
      setCurrentView('shared');
    }
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
  const showEditForm = (note) => {
    setSelectedNote(note);
    setCurrentView('edit');
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
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SkeletonNoteCard key={n} />
                ))}
              </div>
            ) : (
              <>
                <MasonryNotesGrid
                  notes={notes}
                  onViewNote={(note) => {
                    setSelectedNote(note);
                    setCurrentView('detail');
                  }}
                  onEditNote={(note) => {
                    setSelectedNote(note);
                    setCurrentView('edit');
                  }}
                  onShareNote={handleShareNote}
                  onDeleteNote={async (note) => {
                    if (window.confirm('Are you sure you want to delete this note?')) {
                      try {
                        await notesApi.deleteNote(note.id);
                        loadNotes();
                      } catch (error) {
                        console.error('Error deleting note:', error);
                      }
                    }
                  }}
                />
                <Fab onClick={() => setCurrentView('create')} />
              </>
            )}
          </>
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

  const handleSignup = async (userData) => {
    try {
      await notesApi.auth.signup(userData);
      setAuthView('login');
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Signup failed. Please try again.');
    }
  };

  // Render auth view (login/signup)
  const renderAuthView = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {authView === 'login' ? (
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={() => setAuthView('signup')}
              onGuestLogin={handleGuestLogin}
            />
          ) : (
            <Signup
              onSignup={handleSignup}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
        </div>
      </div>
    );
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
    <ThemeProvider>
      <div className="App min-h-screen bg-gradient-to-r from-[#fdfbfb] to-[#ebedee] dark:from-[#141E30] dark:to-[#243B55] transition-all duration-500">
        {!isAuthenticated ? (
          renderAuthView()
        ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            username={localStorage.getItem('username') || 'User'}
            activeSection={activeSection}
            onNavigate={(section) => {
              setActiveSection(section);
              if (section === 'all') {
                setCurrentView('list');
              }
            }}
            onLogout={handleLogout}
          />
          <div className="flex-1 flex flex-col">
            <Navbar
              username={localStorage.getItem('username') || 'User'}
              onSearch={(query) => {
                // TODO: Implement search functionality
                console.log('Search:', query);
              }}
              onAddNote={() => setCurrentView('create')}
              onLogout={handleLogout}

            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto px-6 py-6 ml-16 md:ml-16">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-between">
                    <span>{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}

                {currentView !== 'list' && (
                  <button 
                    onClick={showNotesList}
                    className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ← Back to Notes
                  </button>
                )}

                {renderCurrentView()}
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}

export default App;