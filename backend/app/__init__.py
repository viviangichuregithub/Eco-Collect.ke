import os
import logging
from flask import Flask, jsonify
from flask_session import Session
import cloudinary

from app.config import DevelopmentConfig, ProductionConfig
from app.extensions import db, bcrypt, migrate, cors, login_manager
from app.models.user import User  
def create_app():
    # Determine environment
    env = os.environ.get("FLASK_ENV", "development").lower()
    config_class = DevelopmentConfig if env == "development" else ProductionConfig

    # Initialize app
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ----------------------------
    # Session setup
    # ----------------------------
    session_dir = os.path.join(os.path.dirname(__file__), "..", "instance", "flask_sessions")
    os.makedirs(session_dir, exist_ok=True)

    app.config.update(
    SESSION_TYPE="filesystem",
    SESSION_FILE_DIR=session_dir,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",   # required for cross-site
    SESSION_COOKIE_SECURE=True,       # must be True for SameSite=None over HTTPS
    SESSION_PERMANENT=False,
)


    # ----------------------------
    # Extensions
    # ----------------------------
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)

    # CORS: ensure origins is a list
    raw_origins = app.config.get("CORS_ORIGINS", [])
    if isinstance(raw_origins, str):
        origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    else:
        origins = raw_origins
    cors.init_app(app, supports_credentials=True, origins=origins)

    # Login manager
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.session_protection = "strong"

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Cloudinary config
    cloudinary.config(
        cloud_name=app.config.get("CLOUDINARY_CLOUD_NAME"),
        api_key=app.config.get("CLOUDINARY_API_KEY"),
        api_secret=app.config.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )

    # ----------------------------
    # Blueprints
    # ----------------------------
    from app.routes.auth import auth_bp
    from app.routes.profile import profile_bp
    from app.routes.uploads import uploads_bp
    from app.routes.centers import centers_bp


    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/profile")
    app.register_blueprint(uploads_bp, url_prefix="/uploads")
    app.register_blueprint(centers_bp, url_prefix="/api/centers")
    
    # ----------------------------
    # Routes
    # ----------------------------
    @app.route("/")
    def index():
        return {
            "message": "Eco-Collect.ke API",
            "version": "1.0.0",
            "status": "running",
            "environment": env,
            "endpoints": {
                "auth": "/auth",
                "profile": "/profile",
                "uploads": "/uploads",
                "centers": "/api/centers",
                "health": "/health",
            },
            "documentation": "See AI_CLASSIFICATION_README.md",
        }

    @app.route("/health")
    def health():
        return {"status": "healthy", "service": "eco-collect-api"}

    # ----------------------------
    # Error handlers
    # ----------------------------
    @app.errorhandler(404)
    def not_found_error(e):
        return jsonify({"error": "Not Found", "message": str(e)}), 404

    @app.errorhandler(500)
    def internal_error(e):
        # Rollback in case of DB errors
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

    # ----------------------------
    # Logging
    # ----------------------------
    logging.basicConfig(level=logging.INFO)
    app.logger.info(f"App initialized in {env} environment")

    return app
