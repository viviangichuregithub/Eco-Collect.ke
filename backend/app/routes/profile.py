from flask import Blueprint, request, jsonify, session, current_app, send_from_directory, url_for
from werkzeug.utils import secure_filename
from app.models import User, db
import os, secrets
from datetime import datetime

profile_bp = Blueprint("profile_bp", __name__)

# Allowed file types for avatar
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------------------
# GET CURRENT USER PROFILE
# -------------------------------
@profile_bp.route("/me", methods=["GET"])
def get_profile():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    avatar_url = url_for('profile_bp.uploaded_file', filename=os.path.basename(user.profile_image), _external=True) if user.profile_image else None

    return jsonify({
        "id": user.id,
        "name": user.user_name,
        "email": user.email,
        "avatar": avatar_url,
        "memberSince": user.created_at.strftime('%B %Y') if user.created_at else None,
        "points": user.point_score
    }), 200

# -------------------------------
# UPLOAD AVATAR
# -------------------------------
@profile_bp.route("/upload-avatar", methods=["POST"])
def upload_avatar():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    if "image" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        random_hex = secrets.token_hex(8)
        _, ext = os.path.splitext(filename)
        new_filename = f"{random_hex}{ext}"

        upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, new_filename)
        file.save(filepath)

        user = User.query.get(user_id)
        user.profile_image = f"{upload_folder}/{new_filename}"  # store relative path
        db.session.commit()

        avatar_url = url_for('profile_bp.uploaded_file', filename=new_filename, _external=True)

        return jsonify({
            "message": "Avatar uploaded successfully",
            "avatar": avatar_url
        }), 200
    else:
        return jsonify({"error": "Invalid file type. Allowed types: png, jpg, jpeg, gif"}), 400

# -------------------------------
# SERVE UPLOADED FILES
# -------------------------------
@profile_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    if not os.path.exists(os.path.join(upload_folder, filename)):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(upload_folder, filename)
