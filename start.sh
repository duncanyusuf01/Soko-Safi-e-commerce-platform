#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Apply database migrations
echo "Applying database migrations..."
flask db upgrade

# Determine how to run the application
if command -v gunicorn &> /dev/null; then
    echo "Starting production server (gunicorn)..."
    gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 4 app:app
else
    echo "Gunicorn not found. Starting development server (flask run)..."
    echo "WARNING: This is not suitable for production!"
    export FLASK_APP=app.py
    export FLASK_ENV=development
    flask run --host=0.0.0.0 --port=${PORT:-8000}
fi