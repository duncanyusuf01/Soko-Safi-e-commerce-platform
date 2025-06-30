#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Activate virtual environment (if exists)
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Apply database migrations
echo "→ Applying database migrations..."
flask db upgrade || {
    echo "Failed to apply migrations!"
    exit 1
}

# Start the application
echo "→ Starting application server..."
if command -v gunicorn &> /dev/null; then
    echo "Using Gunicorn (production)"
    exec gunicorn --bind 0.0.0.0:${PORT:-8000} \
         --workers ${WORKERS:-4} \
         --timeout 120 \
         --access-logfile - \
         --error-logfile - \
         app:app
else
    echo "Gunicorn not found! Using Flask dev server (not for production)"
    flask run --host=0.0.0.0 --port=${PORT:-8000}
fi