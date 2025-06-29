# server/config.py

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
import os
from dotenv import load_dotenv # Import load_dotenv

# Load environment variables from .env file locally
# This line should be at the very top, immediately after imports,
# if you use a .env file for local development.
load_dotenv()

# Define metadata for naming conventions
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# Initialize SQLAlchemy with the defined metadata
db = SQLAlchemy(metadata=metadata)

# Get the absolute path of the directory the script is in
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Define the database URI
# Prioritize DATABASE_URL from environment (Render's PostgreSQL)
# Fallback to DB_URI (if you explicitly set it locally)
# Fallback to local SQLite if neither DATABASE_URL nor DB_URI is set
DATABASE_URI = os.environ.get(
    "DATABASE_URL", # Render's default for PostgreSQL
    os.environ.get("DB_URI", f"sqlite:///{os.path.join(BASE_DIR, 'instance', 'app.db')}")
)

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.json.compact = False  # Prettify JSON responses
    
    # It's better to get secret_key from environment variables for production
    app.secret_key = os.environ.get('SECRET_KEY', b'\x9c\x02\x1e\x87\xe8\xde\n\xe0\x91\xe2\x15\xc8\x04\x0e\xde\xb5')

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    Bcrypt(app) # Bcrypt initialized here

    return app