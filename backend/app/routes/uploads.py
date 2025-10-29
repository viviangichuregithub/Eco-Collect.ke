# uploads_bp.py
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app, send_from_directory, session
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models.uploads import Upload
from app.models.centers import centers as CentersModel
from app.models.user import User  # needed for approve_upload
from ai.create_model import predict
import os

uploads_bp = Blueprint("uploads", __name__, url_prefix="/uploads")

UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "bmp", "gif"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Serve uploaded images
@uploads_bp.route("/<filename>")
def uploaded_file(filename):
    return send_from_directory(str(UPLOAD_FOLDER), filename)


# --- POST: Upload + AI classification ---
@uploads_bp.route("/", methods=["POST"])
def upload_file():
    user_id = session.get("user_id")
    user_name = session.get("user_name") or "anonymous"
    if not user_id:
        return jsonify({"error": "You must be logged in to submit."}), 401

    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"error": "No file provided"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    filename = secure_filename(file.filename)
    filepath = UPLOAD_FOLDER / filename
    file.save(filepath)

    try:
        prediction = predict(str(filepath))
        category = prediction.get("category", "unknown")
        confidence = float(prediction.get("confidence", 0.0))
        points_awarded = int(confidence * 100)
    except Exception as e:
        current_app.logger.error(f"AI prediction failed: {e}")
        category, confidence, points_awarded = "unknown", 0.0, 0

    preview = request.form.get("preview", type=lambda v: v.lower() == "true")
    if preview:
        if filepath.exists():
            filepath.unlink()
        return jsonify({
            "upload": {"category": category, "confidence": confidence, "points_awarded": points_awarded}
        }), 200

    weight = request.form.get("weight", type=float)
    centre_id = request.form.get("centre_id", type=int)

    if centre_id:
        centre = CentersModel.query.get(centre_id)
        if not centre:
            return jsonify({"error": "Center not found"}), 404

    upload = Upload(
        user_id=user_id,
        user_name=user_name,
        filename_url=filename,
        weight=weight,
        centre_id=centre_id,
        category=category,
        confidence=confidence,
        points_awarded=points_awarded
    )
    db.session.add(upload)
    db.session.commit()

    if filepath.exists():
        filepath.unlink()

    return jsonify({"upload": {
        "id": upload.id,
        "category": upload.category,
        "confidence": upload.confidence,
        "points_awarded": upload.points_awarded,
        "weight": upload.weight,
        "centre_id": upload.centre_id,
        "upload_date": upload.upload_date.isoformat(),
    }}), 201


# --- GET: User uploads ---
@uploads_bp.route("/", methods=["GET"])
def get_user_uploads():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "You must be logged in to view uploads."}), 401

    uploads_query = Upload.query.filter_by(user_id=user_id).order_by(Upload.upload_date.desc()).all()
    uploads = [{
        "id": u.id,
        "user_id": u.user_id,
        "user_name": u.user_name,
        "filename_url": u.filename_url,
        "category": u.category,
        "confidence": u.confidence,
        "points_awarded": u.points_awarded,
        "weight": u.weight,
        "centre_id": u.centre_id,
        "not_verified": u.not_verified,
        "upload_date": u.upload_date.isoformat(),
    } for u in uploads_query]

    return jsonify({"uploads": uploads}), 200


@uploads_bp.route("/all", methods=["GET"])
def get_all_uploads():
    # role = session.get("role")
    # if role != "corporative":
    #     return jsonify({"error": "Unauthorized: corporate access only"}), 403

    not_verified = request.args.get("not_verified", default=None, type=str)
    query = Upload.query.order_by(Upload.upload_date.desc())
    if not_verified is not None:
        is_not_verified = not_verified.lower() == "true"
        query = query.filter_by(not_verified=is_not_verified)

    uploads = [{
        "id": u.id,
        "user_id": u.user_id,
        "user_name": u.user_name,
        "filename_url": u.filename_url,
        "category": u.category,
        "confidence": u.confidence,
        "points_awarded": u.points_awarded,
        "weight": u.weight,
        "centre_id": u.centre_id,
        "not_verified": u.not_verified,
        "upload_date": u.upload_date.isoformat(),
    } for u in query]

    return jsonify({"uploads": uploads, "count": len(uploads)}), 200



@uploads_bp.route("/approve/<int:upload_id>", methods=["PATCH"])
def approve_upload(upload_id):
    try:
        upload = Upload.query.get(upload_id)
        if not upload:
            return jsonify({"error": "Upload not found"}), 404

        if not upload.not_verified:
            return jsonify({"message": "Upload already verified"}), 200

        # Mark as verified
        upload.not_verified = False

        # Update user's points
        user = User.query.get(upload.user_id)
        if user:
            points_to_add = upload.points_awarded or 0
            user.point_score = (user.point_score or 0) + points_to_add
            db.session.add(user)
        else:
            current_app.logger.warning(f"User {upload.user_id} not found for upload {upload.id}")

        db.session.commit()

        return jsonify({
            "message": f"Upload #{upload.id} verified successfully.",
            "upload": {
                "id": upload.id,
                "user_id": upload.user_id,
                "points_awarded": upload.points_awarded,
                "not_verified": upload.not_verified
            },
            "user_point_score": user.point_score if user else None
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error approving upload {upload_id}: {e}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

# --- GET: Centers ---
@uploads_bp.route("/centres", methods=["GET"])
def get_centres():
    centres = CentersModel.query.order_by(CentersModel.name.asc()).all()
    return jsonify([{"id": c.id, "name": c.name, "location": getattr(c, "location", None)} for c in centres]), 200
