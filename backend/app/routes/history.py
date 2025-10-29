from flask import Blueprint, request, jsonify
from app.models.uploads import Upload

history_bp = Blueprint("history", __name__, url_prefix="/uploads/history")

@history_bp.route("/", methods=["GET"])
def get_user_history():
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    uploads = Upload.query.filter_by(user_id=user_id).order_by(Upload.upload_date.desc()).all()
    submissions = []
    for u in uploads:
        submissions.append({
            "id": u.id,
            "filename_url": u.filename_url,
            "category": u.category,
            "weight": u.weight,
            "points_awarded": u.points_awarded,
            "not_verified": u.not_verified,
            "centre": {
                "id": u.centre_id,
                "name": getattr(u.centre, "name", None) if u.centre else None
            },
            "upload_date": u.upload_date.isoformat()
        })

    return jsonify({"submissions": submissions}), 200
