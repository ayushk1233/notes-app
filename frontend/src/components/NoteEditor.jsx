import React from 'react';
import ReactQuill from 'react-quill';
import ReactMarkdown from 'react-markdown';
import 'react-quill/dist/quill.snow.css';

const NoteEditor = ({ content, onChange, preview = false }) => {
  // Quill modules configuration
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  // Quill formats allowed
  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className="w-full space-y-4">
      {/* Editor */}
      {!preview && (
        <div className="prose max-w-none">
          <ReactQuill
            value={content}
            onChange={onChange}
            modules={modules}
            formats={formats}
            className="bg-white rounded-lg shadow-sm"
            theme="snow"
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="prose max-w-none bg-white p-6 rounded-lg shadow-sm">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
