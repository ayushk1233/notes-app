# Notes App

A full-stack notes application with a React frontend and FastAPI backend. This application allows users to create, manage, and share notes with a modern, responsive interface.

## Project Structure

```
notes-app/
├── backend/          # FastAPI backend
│   ├── auth.py      # Authentication logic
│   ├── database.py  # Database configuration
│   ├── main.py      # Main application entry point
│   ├── models.py    # Database models
│   ├── schemas.py   # Pydantic schemas
│   └── requirements.txt
└── frontend/        # React frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # React context
    │   └── services/    # API services
    └── package.json
```

## Technologies Used

### Backend
- Python 3.13
- FastAPI - Modern, fast web framework
- SQLAlchemy - SQL toolkit and ORM
- SQLite - Database
- Python-Jose - JWT token handling
- Passlib - Password hashing
- Uvicorn - ASGI server

### Frontend
- React.js
- Tailwind CSS - Utility-first CSS framework
- React Context - State management
- React Router - Navigation
- Axios - HTTP client

## Setup Guide

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python3 -m venv venv
```

3. Activate the virtual environment:
- On macOS/Linux:
```bash
source venv/bin/activate
```
- On Windows:
```bash
.\venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Features

- User authentication (signup/login)
- Create, read, update, and delete notes
- Share notes with other users
- Drag and drop notes organization
- Masonry grid layout
- Dark/light theme toggle
- Responsive design
- Search functionality
- Real-time updates

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for the interactive API documentation.

## Troubleshooting Guide

### Common Issues

1. **ModuleNotFoundError: No module named 'jose'**
   
   Solution:
   - Ensure you're in the virtual environment
   - Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   - If the error persists, install python-jose directly:
   ```bash
   pip install python-jose[cryptography]
   ```

2. **"externally-managed-environment" Error on macOS**
   
   Solution:
   - Create and use a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
   - Then install dependencies within the virtual environment

3. **Address already in use**
   
   Solution:
   - Change the port for the backend:
   ```bash
   uvicorn main:app --reload --port 8001
   ```
   - Or find and terminate the process using the default port

4. **Frontend npm start fails**
   
   Solution:
   - Clear npm cache:
   ```bash
   npm cache clean --force
   ```
   - Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Development Best Practices

1. Always activate the virtual environment before running the backend
2. Keep dependencies up to date in both frontend and backend
3. Check the console for error messages
4. Ensure all required environment variables are set
5. Use the API documentation for testing endpoints

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

MIT License

## Contact

- Repository: https://github.com/ayushk1233/notes-app
