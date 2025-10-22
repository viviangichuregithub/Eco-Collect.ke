from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import DevelopmentConfig
from .db import Base, engine
from .routes.user_route import bp as user_bp


def create_app(config_class=DevelopmentConfig):
    """
    Flask application factory pattern
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- Initialize extensions ---
    CORS(app, supports_credentials=True, origins=[app.config["CORS_ORIGINS"]])
    JWTManager(app)

    # --- Register blueprints ---
    app.register_blueprint(user_bp, url_prefix="/api/users")

    # --- Initialize database ---
    Base.metadata.create_all(bind=engine)

    # --- Basic route for testing ---
    @app.route("/")
    def home():
        return jsonify({"message": "Eco-Collect backend running "})

    return app
