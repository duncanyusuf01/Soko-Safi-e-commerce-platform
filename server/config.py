# server/config.py

from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
import os

# Define metadata for naming conventions
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# Initialize SQLAlchemy with the defined metadata
db = SQLAlchemy(metadata=metadata)

# Get the absolute path of the directory the script is in
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# Define the database URI
# DATABASE_URI = os.environ.get(
#     "DB_URI", f"postgresql://soko_safi_db_user:HMVhb7WW5W7N02Ki7VFweUKv7IFaOQfM@dpg-d1go76fgi27c73bvasug-a.oregon-postgres.render.com/soko_safi_db"
# )

DATABASE_URI = os.environ.get(
    "DB_URI", f"postgresql://soko_safi_db_user:HMVhb7WW5W7N02Ki7VFweUKv7IFaOQfM@dpg-d1go76fgi27c73bvasug-a.oregon-postgres.render.com/soko_safi_db"
)

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.json.compact = False  # Prettify JSON responses
    app.secret_key = b'fbc39b2b7e2e42973ec88ef43a265900435fbcc526a9b254a0cd20c1623dd259'

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    Bcrypt(app)

    return app