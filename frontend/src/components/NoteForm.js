import React, { useState, useEffect } from 'react';
import './NoteForm.css';

const NoteForm = ({ note, onSubmit, onCancel, loading, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});

  // Load note data for editing
  useEffect(() => {
    if (note && isEditing) {
      setFormData({
        title: note.title || '',
        content: note.content || ''
      });
    }
  }, [note, isEditing]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Form will be reset by parent component navigation
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle specific error cases if needed
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData({ title: '', content: '' });
    setErrors({});
    onCancel();
  };

  return (
    <div className="note-form-container">
      <div className="form-header">
        <h2>{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter note title..."
            className={errors.title ? 'error' : ''}
            disabled={loading}
            maxLength="200"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
          <div className="char-count">
            {formData.title.length}/200
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your note content here..."
            rows="10"
            disabled={loading}
          />
          <div className="char-count">
            {formData.content.length} characters
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Note' : 'Create Note'
            )}
          </button>
        </div>
      </form>

      {/* Form tips */}
      <div className="form-tips">
        <h4>💡 Tips:</h4>
        <ul>
          <li>Use a descriptive title to easily find your note later</li>
          <li>You can always edit your note after creating it</li>
          <li>Share important notes with others using the share button</li>
        </ul>
      </div>
    </div>
  );
};

export default NoteForm;