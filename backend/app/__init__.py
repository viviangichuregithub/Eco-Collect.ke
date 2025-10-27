from flask import Flask, send_from_directory
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
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from app.routes.uploads import uploads_bp
    app.register_blueprint(uploads_bp, url_prefix="/api/uploads")

    from app.routes.submissions import submissions_bp
    app.register_blueprint(submissions_bp, url_prefix="/api/submissions")

    from app.routes.centers import centers_bp
    app.register_blueprint(centers_bp, url_prefix="/api/centers")

    from app.routes.profile import profile_bp
    app.register_blueprint(profile_bp, url_prefix="/api/profile")

    # Import models to ensure they are loaded for migrations
    from app.models import user, uploads  # ensure all models are loaded

    # Serve uploaded images
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        return send_from_directory(uploads_dir, filename)

    # Add a simple index route to show available endpoints
    @app.route('/')
    def index():
        return {
            'message': 'Eco-Collect.ke API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'auth': '/auth',
                'uploads': '/api/uploads',
                'submissions': '/api/submissions',
                'centers': '/api/centers',
                'static_uploads': '/uploads/<filename>',
                'health': '/health'
            },
            'documentation': 'See AI_CLASSIFICATION_README.md'
        }
    
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'service': 'eco-collect-api'}

    os.makedirs(app.config["SESSION_FILE_DIR"], exist_ok=True)

    return app
