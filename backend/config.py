import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    # General App Config
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT & Security
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_jwt_secret")
    COOKIE_NAME = os.environ.get("COOKIE_NAME", "eco_collect_token")
    COOKIE_SECURE = False  # set True in production
    COOKIE_SAMESITE = "Lax"
    ACCESS_TOKEN_EXPIRES = 3600  # seconds

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000")

    # Database (default: SQLite local file)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(BASE_DIR, 'eco_collect.db')}"
    )


class DevelopmentConfig(Config):
    DEBUG = True
