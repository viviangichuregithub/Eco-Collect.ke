# backend/app/routes/centers.py
from flask import Blueprint, request, jsonify, make_response, current_app, g, session
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.centers import centers as CentersModel

centers_bp = Blueprint("centers", __name__, url_prefix="/api/centers")


def _get_created_by_from_request(data: dict):
   
    if not isinstance(data, dict):
        return None
    created_by = data.get("created_by")
    if created_by:
        try:
            return int(created_by)
        except (TypeError, ValueError):
            return None
    # try common places
    try:
        if hasattr(g, "current_user") and getattr(g.current_user, "id", None):
            return int(g.current_user.id)
    except Exception:
        pass
    try:
        if session and session.get("user_id"):
            return int(session.get("user_id"))
    except Exception:
        pass
    return None


@centers_bp.route("/", methods=["GET"])
def list_centers():
    """List all centers."""
    items = CentersModel.query.order_by(CentersModel.id).all()
    return jsonify([i.to_dict() for i in items]), 200


@centers_bp.route("/", methods=["POST"])
def create_center():
    """Create a new center. Expects JSON with at least `location` and `created_by` (or inferable)."""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()

    # If created_by missing, try to infer it
    if "created_by" not in data or not data.get("created_by"):
        inferred = _get_created_by_from_request(data)
        if inferred:
            data["created_by"] = inferred

    try:
        center = CentersModel.create_from_dict(data, commit=True)
    except ValueError as e:
        # create_from_dict raises ValueError for missing required fields
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError:
        current_app.logger.exception("DB error creating center")
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500

    resp = make_response(jsonify(center.to_dict()), 201)
    resp.headers["Location"] = f"/api/centers/{center.id}"
    return resp


@centers_bp.route("/<int:center_id>", methods=["GET"])
def get_center(center_id: int):
    """Get one center by id."""
    center = CentersModel.query.get(center_id)
    if not center:
        return jsonify({"error": "Center not found"}), 404
    return jsonify(center.to_dict()), 200


@centers_bp.route("/<int:center_id>", methods=["PUT", "PATCH"])
def update_center(center_id: int):
    """Update a center. Accepts JSON with permitted fields (name, company, location, etc.)."""
    center = CentersModel.query.get(center_id)
    if not center:
        return jsonify({"error": "Center not found"}), 404

    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()

    try:
        center.update_from_dict(data, commit=True)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except SQLAlchemyError:
        current_app.logger.exception("DB error updating center")
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500

    return jsonify(center.to_dict()), 200


@centers_bp.route("/<int:center_id>", methods=["DELETE"])
def delete_center(center_id: int):
    """Delete a center."""
    center = CentersModel.query.get(center_id)
    if not center:
        return jsonify({"error": "Center not found"}), 404

    try:
        db.session.delete(center)
        db.session.commit()
    except SQLAlchemyError:
        current_app.logger.exception("DB error deleting center")
        db.session.rollback()
        return jsonify({"error": "Database error"}), 500

    return "", 204