"""
Upload routes for waste photo handling and AI classification
"""
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from app.services.ai_classifier import WasteClassifier

uploads_bp = Blueprint('uploads', __name__)
classifier = WasteClassifier()

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@uploads_bp.route('/photo', methods=['POST'])
def upload_photo():
    """Upload waste photo"""
    try:
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
        
        return jsonify({
            'file_id': file_id,
            'filename': filename,
            'upload_timestamp': datetime.utcnow().isoformat(),
            'message': 'File uploaded successfully'
        }), 201
        
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': 'Failed to upload file'}), 500

@uploads_bp.route('/<file_id>/classify', methods=['POST'])
def classify_waste(file_id):
    """Classify waste using AI model"""
    try:
        # Find the uploaded file
        uploaded_file = None
        for ext in ALLOWED_EXTENSIONS:
            filepath = os.path.join(UPLOAD_FOLDER, f"{file_id}.{ext}")
            if os.path.exists(filepath):
                uploaded_file = filepath
                break
        
        if not uploaded_file:
            return jsonify({'error': 'File not found'}), 404
        
        # Perform AI classification
        classification_result = classifier.classify_image(uploaded_file)
        
        return jsonify(classification_result), 200
        
    except Exception as e:
        print(f"Classification error: {str(e)}")
        return jsonify({'error': 'Failed to classify waste', 'details': str(e)}), 500

@uploads_bp.route('/<file_id>', methods=['DELETE'])
def delete_upload(file_id):
    """Delete uploaded file"""
    try:
        deleted = False
        for ext in ALLOWED_EXTENSIONS:
            filepath = os.path.join(UPLOAD_FOLDER, f"{file_id}.{ext}")
            if os.path.exists(filepath):
                os.remove(filepath)
                deleted = True
                break
        
        if not deleted:
            return jsonify({'error': 'File not found'}), 404
        
        return jsonify({'message': 'File deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete file'}), 500
