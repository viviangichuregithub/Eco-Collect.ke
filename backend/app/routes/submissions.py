"""
Submission routes for tracking waste submissions using database models
"""

from flask import Blueprint, request, jsonify, session
from datetime import datetime

from app.models.uploads import Upload
from app.models.user import User
from app.extensions import db

submissions_bp = Blueprint('submissions', __name__)


def get_current_user_id():
    """
    Get current user ID from session (matches auth system)
    """
    user_id = session.get('user_id')
    
    if not user_id:
        # Fallback to header for backward compatibility
        user_id = request.headers.get('X-User-ID')
        if user_id:
            return int(user_id)
        
        # No user found
        return None
    
    return user_id


@submissions_bp.route('', methods=['POST'])
def create_submission():
    """
    Create a new waste submission
    This is called when user submits the upload form with weight, center, etc.
    """
    try:
        data = request.get_json()
        user_id = get_current_user_id()
        
        # Debug logging
        print(f"DEBUG /submissions POST: user_id={user_id}")
        print(f"DEBUG session: {session}")
        print(f"DEBUG data: {data}")
        
        # Require authentication
        if not user_id:
            return jsonify({'error': 'Unauthorized - please log in'}), 401
        
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
            
            # Debug points calculation
            print(f"DEBUG: Points calculation - waste_type={upload.waste_type}, weight={upload.weight}, points_earned={upload.points_earned}")
            
            # Update user's total points
            user = User.query.get(user_id)
            if user:
                old_points = user.point_score or 0
                user.point_score = old_points + upload.points_earned
                print(f"DEBUG: Updated user points - old={old_points}, earned={upload.points_earned}, new={user.point_score}")
            else:
                print(f"ERROR: User not found with id={user_id}")
        else:
            print(f"WARNING: Cannot calculate points - waste_type={upload.waste_type}, weight={upload.weight}")
        
        upload.submitted_at = datetime.utcnow()
        upload.status = 'pending'
        
        print(f"DEBUG: Setting submitted_at={upload.submitted_at}, status={upload.status}")
        
        db.session.commit()
        
        print(f"DEBUG: Submission saved successfully - upload_id={upload.id}, submitted_at={upload.submitted_at}")
        
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
        
        # Debug logging
        print(f"DEBUG /submissions/history: user_id={user_id}")
        print(f"DEBUG session: {session}")
        
        if not user_id:
            return jsonify({'error': 'Unauthorized - no user session found'}), 401
        
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Filter parameters - ignore 'undefined' string values
        status = request.args.get('status')
        if status == 'undefined' or status == 'all':
            status = None
            
        waste_type = request.args.get('type')
        if waste_type == 'undefined' or waste_type == 'all':
            waste_type = None
        
        print(f"DEBUG: Filters - status={status}, type={waste_type}")
        
        # Build query - only get submitted uploads
        query = Upload.query.filter(
            Upload.user_id == user_id,
            Upload.is_deleted == False,
            Upload.submitted_at.isnot(None)  # Only submitted uploads
        )
        
        # Debug: count total submissions
        total_submissions = query.count()
        print(f"DEBUG: Found {total_submissions} total submissions for user {user_id}")
        
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
        
        print(f"DEBUG: Returning {len(submissions)} submissions")
        print(f"DEBUG: First submission: {submissions[0] if submissions else 'None'}")

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
