"""
Upload routes for waste photo handling and AI classification
"""
from flask import Blueprint, request, jsonify, g, session
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from app.services.ai_classifier import WasteClassifier
from app.models.uploads import Upload, CollectionCenter
from app.models.user import User
from app.extensions import db
from functools import wraps

uploads_bp = Blueprint('uploads', __name__)
classifier = WasteClassifier()  # Uses heuristic algorithm (no TensorFlow needed)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

@uploads_bp.route('/photo', methods=['POST'])
def upload_photo():
    """Upload waste photo and create Upload record"""
    try:
        # Get current user
        user_id = get_current_user_id()
        
        # Debug logging
        print(f"DEBUG: Request files: {request.files}")
        print(f"DEBUG: User ID from session: {user_id}")
        print(f"DEBUG: Session data: {session}")
        
        # Require authentication
        if not user_id:
            return jsonify({'error': 'Unauthorized - please log in'}), 401
        
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif, webp'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': f'File size exceeds maximum limit of {MAX_FILE_SIZE / (1024*1024)}MB'}), 400
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        original_extension = secure_filename(file.filename).rsplit('.', 1)[1].lower()
        filename = f"{file_id}.{original_extension}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save file
        file.save(filepath)
        
        # Determine MIME type
        mime_type = f"image/{original_extension}"
        if original_extension == 'jpg':
            mime_type = "image/jpeg"
        
        # Create Upload record in database
        upload = Upload(
            user_id=user_id,
            file_id=file_id,
            filename=filename,
            file_path=filepath,
            file_size=file_size,
            mime_type=mime_type,
            status='pending'
        )
        
        db.session.add(upload)
        db.session.commit()
        
        return jsonify({
            'id': upload.id,
            'file_id': file_id,
            'filename': filename,
            'upload_timestamp': upload.uploaded_at.isoformat(),
            'message': 'File uploaded successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to upload file', 'details': str(e)}), 500

@uploads_bp.route('/<file_id>/classify', methods=['POST'])
def classify_waste(file_id):
    """Classify waste using AI model and update Upload record"""
    try:
        # Find Upload record
        upload = Upload.query.filter_by(file_id=file_id, is_deleted=False).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        # Check if file exists
        if not os.path.exists(upload.file_path):
            return jsonify({'error': 'File not found on disk'}), 404
        
        # Perform AI classification using color-based heuristic algorithm
        classification_result = classifier.classify_image(upload.file_path)
        
        # Update Upload record with classification results
        upload.waste_type = classification_result.get('type')
        upload.confidence_score = classification_result.get('confidence', 0) / 100.0  # Convert to 0-1
        upload.ai_model_version = classification_result.get('model_version', 'heuristic_v1')
        upload.classification_details = classification_result  # Store full response
        upload.classified_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(classification_result), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Classification error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to classify waste', 'details': str(e)}), 500

@uploads_bp.route('/<file_id>/submit', methods=['PATCH'])
def submit_upload(file_id):
    """Submit upload with form data (weight, center, notes, location)"""
    try:
        # Find Upload record
        upload = Upload.query.filter_by(file_id=file_id, is_deleted=False).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        # Verify ownership (user can only submit their own uploads)
        user_id = get_current_user_id()
        if upload.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update upload with submission data
        upload.weight = data.get('weight')
        upload.collection_center_id = data.get('collection_center_id')
        upload.notes = data.get('notes')
        
        # Location data
        if 'location' in data:
            location = data['location']
            upload.latitude = location.get('latitude')
            upload.longitude = location.get('longitude')
            upload.location_address = location.get('address')
        
        # Calculate and award points
        if upload.waste_type and upload.weight:
            upload.points_earned = Upload.calculate_points(upload.waste_type, upload.weight)
            upload.points_status = 'pending'  # Requires admin approval
        
        upload.submitted_at = datetime.utcnow()
        upload.status = 'pending'  # Pending admin review
        
        db.session.commit()
        
        return jsonify({
            'message': 'Submission successful',
            'upload': upload.to_dict(),
            'points_earned': upload.points_earned
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Submit error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to submit upload', 'details': str(e)}), 500

@uploads_bp.route('/<file_id>', methods=['GET'])
def get_upload(file_id):
    """Get upload details"""
    try:
        upload = Upload.query.filter_by(file_id=file_id, is_deleted=False).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        return jsonify(upload.to_dict(include_user=True)), 200
        
    except Exception as e:
        print(f"Get upload error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve upload'}), 500

@uploads_bp.route('/<file_id>', methods=['DELETE'])
def delete_upload(file_id):
    """Soft delete uploaded file"""
    try:
        upload = Upload.query.filter_by(file_id=file_id, is_deleted=False).first()
        
        if not upload:
            return jsonify({'error': 'Upload not found'}), 404
        
        # Verify ownership
        user_id = get_current_user_id()
        if upload.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Soft delete
        upload.is_deleted = True
        upload.deleted_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Upload deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete upload'}), 500

@uploads_bp.route('/user/history', methods=['GET'])
def get_user_uploads():
    """Get user's upload history"""
    try:
        user_id = get_current_user_id()
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        
        # Filters
        status = request.args.get('status')
        waste_type = request.args.get('type')
        
        # Build query
        query = Upload.query.filter_by(user_id=user_id, is_deleted=False)
        
        if status:
            query = query.filter_by(status=status)
        
        if waste_type:
            query = query.filter_by(waste_type=waste_type)
        
        # Order by most recent
        query = query.order_by(Upload.uploaded_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=limit, error_out=False)
        
        uploads = [upload.to_dict() for upload in pagination.items]
        
        return jsonify({
            'uploads': uploads,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
        
    except Exception as e:
        print(f"Get user uploads error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve uploads'}), 500

