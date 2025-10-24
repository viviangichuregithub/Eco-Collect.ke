from flask import Flask
from app.config import DevelopmentConfig
from app.extensions import db, bcrypt, migrate, cors
from flask_session import Session
import os

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Setup session to store cookies in the instance folder
    app.config.update(
        SESSION_TYPE="filesystem",
        SESSION_FILE_DIR=os.path.join(os.path.dirname(__file__), "..", "instance", "flask_sessions"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=False,  # dev only
        SESSION_PERMANENT=False,
    )
    sess = Session(app)  # initialize session

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # CORS with credentials
    cors.init_app(app, supports_credentials=True, origins=[config_class.CORS_ORIGINS])

    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")

    from app.models import user  # ensure models are loaded


    os.makedirs(app.config["SESSION_FILE_DIR"], exist_ok=True)

    return app
