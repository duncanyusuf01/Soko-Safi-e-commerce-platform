#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Install Python dependencies from requirements.txt
echo "Installing Python dependencies..."
pip install -r requirements.txt

# --- CORRECTED LINE ---
export FLASK_APP=server.app # <--- THIS IS THE CHANGE
# --- END CORRECTION ---

# Apply database migrations (assuming Flask-Migrate or similar)
echo "Applying database migrations..."
flask db upgrade

# Start Gunicorn server for production
echo "Starting production server (gunicorn)..."
# The Gunicorn command's 'module:app' part also needs to correctly point to your app.
# It should match the FLASK_APP setting for the module part.
gunicorn --bind 0.0.0.0:${PORT} --workers 4 server.app:app