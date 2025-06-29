#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Install Python dependencies from requirements.txt
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Apply database migrations (assuming Flask-Migrate or similar)
echo "Applying database migrations..."
# The 'flask' command should now be available after 'pip install'
flask db upgrade

# Start Gunicorn server for production
echo "Starting production server (gunicorn)..."
# Ensure 'gunicorn' is listed in your requirements.txt
# Replace 'app:app' with the actual entry point of your Flask application
# (e.g., if your Flask app instance is named `app` in a file called `app.py`,
# then `app:app` is usually correct).
# $PORT is an environment variable provided by Render.
gunicorn --bind 0.0.0.0:${PORT} --workers 4 app:app

# Do NOT include flask run for production deployments.