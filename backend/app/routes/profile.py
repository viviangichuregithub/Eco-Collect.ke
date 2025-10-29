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
    try:
        user_id = session.get("user_id")
        
        # Debug logging
        print(f"DEBUG /profile/upload-avatar: user_id={user_id}")
        print(f"DEBUG: Request files: {request.files}")
        print(f"DEBUG: Request form: {request.form}")
        print(f"DEBUG: Content-Type: {request.content_type}")
        print(f"DEBUG: Session data: {dict(session)}")
        
        if not user_id:
            print("ERROR: User not authenticated")
            return jsonify({"error": "Not authenticated"}), 401

        if "image" not in request.files:
            print(f"ERROR: 'image' not in request.files. Available keys: {list(request.files.keys())}")
            return jsonify({"error": "No file uploaded. Expected 'image' field."}), 400

        file = request.files["image"]
        
        print(f"DEBUG: File object: {file}")
        print(f"DEBUG: Filename: {file.filename}")
        
        if file.filename == "":
            print("ERROR: Empty filename")
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            print(f"ERROR: Invalid file type for {file.filename}")
            return jsonify({"error": f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

        # File is valid, process it
        filename = secure_filename(file.filename)
        random_hex = secrets.token_hex(8)
        _, ext = os.path.splitext(filename)
        new_filename = f"{random_hex}{ext}"

        upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, new_filename)
        
        print(f"DEBUG: Saving to {filepath}")
        file.save(filepath)

        user = User.query.get(user_id)
        if not user:
            print(f"ERROR: User {user_id} not found in database")
            return jsonify({"error": "User not found"}), 404
            
        user.profile_image = f"{upload_folder}/{new_filename}"  # store relative path
        db.session.commit()

        avatar_url = url_for('profile_bp.uploaded_file', filename=new_filename, _external=True)
        
        print(f"DEBUG: Upload successful - avatar_url={avatar_url}")

        return jsonify({
            "message": "Avatar uploaded successfully",
            "avatar": avatar_url
        }), 200
        
    except Exception as e:
        print(f"ERROR: Exception in upload_avatar: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500

# -------------------------------
# SERVE UPLOADED FILES
# -------------------------------
@profile_bp.route("/uploads/<filename>")
def uploaded_file(filename):
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    if not os.path.exists(os.path.join(upload_folder, filename)):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(upload_folder, filename)