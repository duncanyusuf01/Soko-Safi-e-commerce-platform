# server/config.py
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define metadata for naming conventions
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# Initialize extensions
db = SQLAlchemy(metadata=metadata)
bcrypt = Bcrypt()
migrate = Migrate()

def get_database_uri():
    """Get database URI with production/development fallback"""
    # Render PostgreSQL (production)
    if 'DATABASE_URL' in os.environ:
        return os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://')
    # Custom DB_URI if specified
    if 'DB_URI' in os.environ:
        return os.environ['DB_URI']
    # Default SQLite (development)
    return f"sqlite:///{os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance', 'app.db')}"

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config.update({
        'SQLALCHEMY_DATABASE_URI': get_database_uri(),
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SQLALCHEMY_ENGINE_OPTIONS': {
            'pool_pre_ping': True,  # Reconnect if database restarts
            'pool_recycle': 300,    # Recycle connections after 5 minutes
        },
        'JSONIFY_PRETTYPRINT_REGULAR': True,
        'SECRET_KEY': os.environ.get('SECRET_KEY', os.urandom(32).hex()),
        'BCRYPT_LOG_ROUNDS': 12
    })

    # Initialize extensions with app
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints or other app components here if needed
    # from .routes import api_blueprint
    # app.register_blueprint(api_blueprint)

    return app