from flask import Flask
from app.config import DevelopmentConfig, ProductionConfig
from app.extensions import db, bcrypt, migrate, cors
from flask_session import Session
import cloudinary
import os


def create_app():
    # ----------------------------------
    # Select config dynamically
    # ----------------------------------
    env = os.environ.get("FLASK_ENV", "development").lower()
    config_class = DevelopmentConfig if env == "development" else ProductionConfig

    app = Flask(__name__)
    app.config.from_object(config_class)

    # ----------------------------------
    # SESSION CONFIGURATION
    # ----------------------------------
    app.config.update(
        SESSION_TYPE="filesystem",
        SESSION_FILE_DIR=os.path.join(
            os.path.dirname(__file__), "..", "instance", "flask_sessions"
        ),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE=app.config.get("COOKIE_SAMESITE", "Lax"),
        SESSION_COOKIE_SECURE=app.config.get("COOKIE_SECURE", False),
        SESSION_PERMANENT=False,
    )

    os.makedirs(app.config["SESSION_FILE_DIR"], exist_ok=True)
    Session(app)  # initialize session

    # ----------------------------------
    # EXTENSIONS INITIALIZATION
    # ----------------------------------
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    cors.init_app(
        app,
        supports_credentials=True,
        origins=[app.config["CORS_ORIGINS"]],
    )

    # ----------------------------------
    # CLOUDINARY CONFIG
    # ----------------------------------
    cloudinary.config(
        cloud_name=app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=app.config.get("CLOUDINARY_API_KEY"),
        api_secret=app.config.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )

    # ----------------------------------
    # BLUEPRINTS
    # ----------------------------------
    from app.routes.auth import auth_bp
    from app.routes.profile import profile_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/profile")

    # ----------------------------------
    # MODELS IMPORT
    # ----------------------------------
    from app.models import user  # noqa: F401 (ensure model registration)

    # ----------------------------------
    # SIMPLE HEALTH CHECK
    # ----------------------------------
    @app.route("/")
    def home():
        return {"message": "EcoCollect API running", "env": env}, 200

    return app
