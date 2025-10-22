from flask import Blueprint, request, jsonify, make_response, g
from sqlalchemy.exc import IntegrityError
from db import SessionLocal
from models.user import User
from auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    login_required,
    role_required,
    generate_reset_token,
)
from config import Config
import datetime

bp = Blueprint("user", __name__, url_prefix="/api/user")

# ============================================================
# 🔹 REGISTER
# ============================================================
@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    user_name = (data.get("user_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    role = data.get("role") or "civilian"

    if not all([user_name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == email).first():
            return jsonify({"error": "Email already registered"}), 400

        user = User(
            user_name=user_name,
            email=email,
            password_hash=hash_password(password),
            role=role,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Create JWT token
        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

        resp = make_response({"message": "User registered successfully", "role": user.role})
        resp.set_cookie(
            Config.COOKIE_NAME,
            token,
            httponly=True,
            secure=Config.COOKIE_SECURE,
            samesite=Config.COOKIE_SAMESITE,
            max_age=Config.ACCESS_TOKEN_EXPIRES,
        )
        return resp

    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Email already exists"}), 400
    finally:
        db.close()


# ============================================================
# 🔹 LOGIN
# ============================================================
@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            return jsonify({"error": "Invalid credentials"}), 401

        token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        resp = make_response({"message": "Login successful", "role": user.role})
        resp.set_cookie(
            Config.COOKIE_NAME,
            token,
            httponly=True,
            secure=Config.COOKIE_SECURE,
            samesite=Config.COOKIE_SAMESITE,
            max_age=Config.ACCESS_TOKEN_EXPIRES,
        )
        return resp
    finally:
        db.close()


# ============================================================
# 🔹 LOGOUT
# ============================================================
@bp.route("/logout", methods=["POST"])
def logout():
    resp = make_response({"message": "Logged out"})
    resp.set_cookie(Config.COOKIE_NAME, "", expires=0)
    return resp


# ============================================================
# 🔹 PROFILE
# ============================================================
@bp.route("/profile", methods=["GET"])
@login_required
def profile():
    user = g.user
    return jsonify({
        "id": user["id"],
        "user_name": user["user_name"],
        "email": user["email"],
        "role": user["role"],
        "points": user["points"],
        "profile_image": user["profile_image"],
        "created_at": user["created_at"],
    })


# ============================================================
# 🔹 CIVILIAN PAGE
# ============================================================
@bp.route("/civilian", methods=["GET"])
@role_required("civilian")
def civilian_page():
    return jsonify({"message": "Welcome, Civilian! Access granted."})


# ============================================================
# 🔹 CORPORATE PAGE
# ============================================================
@bp.route("/corporate", methods=["GET"])
@role_required("corporate")
def corporate_page():
    return jsonify({"message": "Welcome, Corporate! Access granted."})


# ============================================================
# 🔹 REQUEST PASSWORD RESET
# ============================================================
@bp.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"error": "Email required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Generate token (could be JWT or UUID)
        token = generate_reset_token(user.email)
        user.password_reset_token = token
        db.commit()

        # Normally you'd send an email here
        return jsonify({"message": "Password reset token generated", "token": token})
    finally:
        db.close()


# ============================================================
# 🔹 RESET PASSWORD
# ============================================================
@bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json() or {}
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"error": "Missing token or new password"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.password_reset_token == token).first()
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 400

        user.password_hash = hash_password(new_password)
        user.password_reset_token = None
        db.commit()

        return jsonify({"message": "Password successfully reset"})
    finally:
        db.close()
