import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(os.path.dirname(BASE_DIR), "instance")
os.makedirs(INSTANCE_DIR, exist_ok=True)


class Config:
    # -------------------------------
    # SECURITY
    # -------------------------------
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key")

    # -------------------------------
    # DATABASE
    # -------------------------------
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(INSTANCE_DIR, 'eco_collect.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # -------------------------------
    # AUTH / SESSION / JWT
    # -------------------------------
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_jwt_secret")
    COOKIE_NAME = os.environ.get("COOKIE_NAME", "eco_collect_token")
    COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "False").lower() == "true"
    COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "Lax")
    ACCESS_TOKEN_EXPIRES = int(os.environ.get("ACCESS_TOKEN_EXPIRES", 3600))  # 1 hour

    # -------------------------------
    # CORS (frontend origin)
    # -------------------------------
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000")

    # -------------------------------
    # PAYLOAD / JSON SETTINGS
    # -------------------------------
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB (for JSON / image uploads)
    JSON_AS_ASCII = False  # Ensure UTF-8 encoding
    JSON_SORT_KEYS = False  # Keep response fields in readable order

    # -------------------------------
    # CLOUDINARY (Image Uploads)
    # -------------------------------
    CLOUDINARY_CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY = os.environ.get("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

    # -------------------------------
    # FILE UPLOAD (Local fallback)
    # -------------------------------
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads", "profile_images")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    COOKIE_SECURE = True
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "https://yourdomain.com")
