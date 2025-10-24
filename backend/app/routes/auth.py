from flask import Blueprint, request, jsonify, session
from app.extensions import db, bcrypt
from app.models.user import User
from datetime import datetime
import secrets

auth_bp = Blueprint("auth_bp", __name__)

# -------------------------------
# REGISTER USER
# -------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    user_name = data.get("user_name")
    email = data.get("email")
    password = data.get("password")
    terms_approved = data.get("terms_approved", False)
    role = data.get("role", "civilian")  # default role is civilian

    if not all([user_name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    if User.query.filter_by(user_name=user_name).first():
        return jsonify({"error": "Username already taken"}), 400

    user = User(
        user_name=user_name,
        email=email,
        role=role,
        terms_approved=terms_approved,
        created_at=datetime.utcnow(),
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Optionally auto-login user after registration
    session["user_id"] = user.id
    session["role"] = user.role

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "user_name": user.user_name,
            "email": user.email,
            "role": user.role,
            "point_score": user.point_score
        }
    }), 201



# -------------------------------
# LOGIN USER
# -------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create session
    session["user_id"] = user.id
    session["role"] = user.role

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "user_name": user.user_name,
            "email": user.email,
            "role": user.role,
            "point_score": user.point_score
        }
    }), 200


# -------------------------------
# LOGOUT USER
# -------------------------------
@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


# -------------------------------
# FORGOT PASSWORD (send reset token)
# -------------------------------
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Email not found"}), 404

    # Generate token
    token = secrets.token_urlsafe(32)
    user.password_reset_token = token
    db.session.commit()

    # TODO: send token via email (for now, return it for testing)
    return jsonify({
        "message": "Password reset token generated",
        "reset_token": token
    }), 200


# -------------------------------
# RESET PASSWORD
# -------------------------------
@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    new_password = data.get("new_password")

    user = User.query.filter_by(password_reset_token=token).first()
    if not user:
        return jsonify({"error": "Invalid or expired token"}), 400

    user.set_password(new_password)
    user.password_reset_token = None
    db.session.commit()

    return jsonify({"message": "Password has been reset successfully"}), 200


# -------------------------------
# GET CURRENT USER PROFILE
# -------------------------------
@auth_bp.route("/me", methods=["GET"])
def get_profile():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "user_name": user.user_name,
        "email": user.email,
        "role": user.role,
        "point_score": user.point_score,
        "profile_image": user.profile_image
    }), 200
