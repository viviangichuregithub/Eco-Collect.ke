"""
Submission routes for tracking waste submissions using database models
"""

from flask import Blueprint, request, jsonify
from datetime import datetime

from app.models.uploads import Upload
from app.models.user import User
from app.extensions import db

submissions_bp = Blueprint('submissions', __name__)


def get_current_user_id():
    """
    Get current user ID - temporary implementation
    Must match the logic in uploads.py to ensure same user_id
    """
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return int(user_id)
    
    # For development: ensure at least one user exists (same as uploads.py)
    test_user = User.query.filter_by(email='test@ecocollect.ke').first()
    if not test_user:
        test_user = User(
            user_name='test_user',
            email='test@ecocollect.ke',
            role='civilian'
        )
        test_user.set_password('test123')
        db.session.add(test_user)
        db.session.commit()
    
    return test_user.id


@submissions_bp.route('', methods=['POST'])
def create_submission():
    """
    Create a new waste submission
    This is called when user submits the upload form with weight, center, etc.
    """
    try:
        data = request.get_json()
        user_id = get_current_user_id()
        
        # Validate required fields
        if not data.get('file_id'):
            return jsonify({'error': 'file_id is required'}), 400
        
        # Find the upload by file_id
        upload = Upload.query.filter_by(
            file_id=data['file_id'],
            user_id=user_id,
            is_deleted=False
        ).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found or unauthorized'}), 404
        
        # Update upload with submission data
        upload.weight = data.get('weight')
        upload.collection_center_id = data.get('collection_center_id')
        upload.notes = data.get('notes')
        
        # Update classification if provided (in case it was re-classified)
        if 'classification' in data:
            classification = data['classification']
            upload.waste_type = classification.get('type')
            upload.confidence_score = classification.get('confidence', 0) / 100.0
            upload.classification_details = classification
        
        # Location data
        if 'location' in data:
            location = data['location']
            upload.latitude = location.get('latitude')
            upload.longitude = location.get('longitude')
            upload.location_address = location.get('address')
        
        # Calculate points
        if upload.waste_type and upload.weight:
            upload.points_earned = Upload.calculate_points(upload.waste_type, upload.weight)
            upload.points_status = 'pending'
        
        upload.submitted_at = datetime.utcnow()
        upload.status = 'pending'
        
        db.session.commit()
        
        return jsonify({
            'id': upload.id,
            'file_id': upload.file_id,
            'points_earned': upload.points_earned,
            'status': upload.status,
            'message': 'Submission created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Create submission error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create submission', 'details': str(e)}), 500


@submissions_bp.route('/history', methods=['GET'])
def get_submission_history():
    """
    Get paginated submission history for the current user
    Supports filtering by status and waste type
    """
    try:
        user_id = get_current_user_id()
        
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Filter parameters
        status = request.args.get('status')
        waste_type = request.args.get('type')
        
        # Build query - only get submitted uploads
        query = Upload.query.filter(
            Upload.user_id == user_id,
            Upload.is_deleted == False,
            Upload.submitted_at.isnot(None)  # Only submitted uploads
        )
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
        
        if waste_type:
            query = query.filter_by(waste_type=waste_type)
        
        # Order by submission date (most recent first)
        query = query.order_by(Upload.submitted_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        
        # Format submissions for response
        submissions = []
        for upload in pagination.items:
            submission = {
                'id': upload.id,
                'file_id': upload.file_id,
                'type': upload.waste_type,
                'weight': f"{upload.weight} kg" if upload.weight else 'N/A',
                'center': upload.collection_center.name if upload.collection_center else 'Not specified',
                'status': upload.status,
                'points': upload.points_earned,
                'date': upload.submitted_at.strftime('%Y-%m-%d %H:%M') if upload.submitted_at else 'N/A',
                'confidence': f"{int(upload.confidence_score * 100)}%" if upload.confidence_score else 'N/A',
                'notes': upload.notes
            }
            submissions.append(submission)
        
        return jsonify({
            'submissions': submissions,
            'total': pagination.total,
            'page': page,
            'limit': limit,
            'pages': pagination.pages
        }), 200
        
    except Exception as e:
        print(f"Get submission history error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to retrieve submission history', 'details': str(e)}), 500


@submissions_bp.route('/<int:submission_id>', methods=['GET'])
def get_submission_by_id(submission_id):
    """Get detailed information about a specific submission"""
    try:
        user_id = get_current_user_id()
        
        upload = Upload.query.filter_by(
            id=submission_id,
            user_id=user_id,
            is_deleted=False
        ).first()
        
        if not upload:
            return jsonify({'error': 'Submission not found'}), 404
        
        return jsonify(upload.to_dict(include_user=True)), 200
        
    except Exception as e:
        print(f"Get submission error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve submission'}), 500


@submissions_bp.route('/<int:submission_id>/status', methods=['PATCH'])
def update_submission_status(submission_id):
    """
    Update submission status (admin only)
    Status options: pending, approved, rejected
    """
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['pending', 'approved', 'rejected']:
            return jsonify({'error': 'Invalid status. Must be: pending, approved, or rejected'}), 400
        
        upload = Upload.query.filter_by(id=submission_id, is_deleted=False).first()
        
        if not upload:
            return jsonify({'error': 'Submission not found'}), 404
        
        # Update status
        upload.status = new_status
        upload.reviewed_at = datetime.utcnow()
        upload.reviewed_by = get_current_user_id()  # TODO: Verify admin role
        upload.review_notes = data.get('notes')
        
        # Award points if approved
        if new_status == 'approved' and upload.points_status == 'pending':
            upload.points_status = 'awarded'
            
            # Add points to user
            user = User.query.get(upload.user_id)
            if user:
                user.add_points(upload.points_earned)
        
        # Reject points if rejected
        elif new_status == 'rejected':
            upload.points_status = 'rejected'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Status updated successfully',
            'submission': upload.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Update status error: {str(e)}")
        return jsonify({'error': 'Failed to update status'}), 500
