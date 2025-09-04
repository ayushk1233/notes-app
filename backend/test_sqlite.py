import sqlite3
import os
from datetime import datetime

def test_sqlite_setup():
    print("=== SQLite Setup Test ===")
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect('notes.db')
        cursor = conn.cursor()
        
        print("✅ Connected to SQLite successfully!")
        
        # Create table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT DEFAULT '',
                shared BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        print("✅ Notes table created successfully!")
        
        # Insert test data
        cursor.execute(
            "INSERT INTO notes (title, content) VALUES (?, ?)",
            ("Welcome Note", "Your SQLite notes app is working!")
        )
        
        # Fetch the data
        cursor.execute("SELECT * FROM notes")
        notes = cursor.fetchall()
        
        print(f"✅ Test data inserted! Found {len(notes)} notes")
        
        for note in notes:
            print(f"   - ID: {note[0]}, Title: '{note[1]}'")
        
        conn.commit()
        conn.close()
        
        # Check if database file was created
        if os.path.exists('notes.db'):
            size = os.path.getsize('notes.db')
            print(f"✅ Database file created: notes.db ({size} bytes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_sqlite_setup()