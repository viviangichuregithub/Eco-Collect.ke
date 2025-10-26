"""
Upload model for tracking waste photo uploads and submissions
"""
from datetime import datetime
from app.extensions import db


class Upload(db.Model):
    """
    Represents a waste photo upload with AI classification results
    """
    __tablename__ = "uploads"

    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key to User
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # File information
    file_id = db.Column(db.String(100), unique=True, nullable=False, index=True)  # UUID
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=True)  # Size in bytes
    mime_type = db.Column(db.String(50), nullable=True)  # image/jpeg, image/png
    
    # AI Classification results
    waste_type = db.Column(db.String(50), nullable=True)  # plastic, glass, metal, paper, organic, e-waste, hazardous, other
    confidence_score = db.Column(db.Float, nullable=True)  # 0.0 to 1.0
    ai_model_version = db.Column(db.String(50), nullable=True)  # For tracking which model version was used
    classification_details = db.Column(db.JSON, nullable=True)  # Store full AI response (features, scores, etc.)
    
    # Submission details (from form)
    weight = db.Column(db.Float, nullable=True)  # Weight in kg
    collection_center_id = db.Column(db.Integer, db.ForeignKey('collection_centers.id'), nullable=True, index=True)
    notes = db.Column(db.Text, nullable=True)  # User's notes/description
    
    # Location data
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_address = db.Column(db.String(500), nullable=True)
    
    # Submission status
    status = db.Column(
        db.String(20), 
        nullable=False, 
        default='pending',
        index=True
    )  # pending, approved, rejected, processing
    
    # Points and rewards
    points_earned = db.Column(db.Integer, default=0)
    points_status = db.Column(db.String(20), default='pending')  # pending, awarded, rejected
    
    # Admin review
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Admin user who reviewed
    review_notes = db.Column(db.Text, nullable=True)  # Admin's review comments
    reviewed_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    classified_at = db.Column(db.DateTime, nullable=True)  # When AI classification completed
    submitted_at = db.Column(db.DateTime, nullable=True)  # When user submitted the form
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Soft delete
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='uploads')
    reviewer = db.relationship('User', foreign_keys=[reviewed_by], backref='reviewed_uploads')
    collection_center = db.relationship('CollectionCenter', backref='uploads')
    
    def __repr__(self):
        return f"<Upload {self.file_id} by User {self.user_id} - {self.waste_type}>"
    
    def to_dict(self, include_user=False):
        """Convert upload to dictionary for JSON response"""
        data = {
            'id': self.id,
            'file_id': self.file_id,
            'filename': self.filename,
            'user_id': self.user_id,
            'waste_type': self.waste_type,
            'confidence_score': self.confidence_score,
            'weight': self.weight,
            'collection_center_id': self.collection_center_id,
            'notes': self.notes,
            'status': self.status,
            'points_earned': self.points_earned,
            'points_status': self.points_status,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'classified_at': self.classified_at.isoformat() if self.classified_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'review_notes': self.review_notes,
            'location': {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'address': self.location_address
            } if self.latitude and self.longitude else None
        }
        
        if include_user and self.user:
            data['user'] = {
                'id': self.user.id,
                'username': self.user.user_name,
                'email': self.user.email
            }
        
        return data
    
    @staticmethod
    def calculate_points(waste_type, weight):
        """
        Calculate points based on waste type and weight
        Points per kg:
        - E-waste: 50 points/kg (highest value)
        - Glass: 30 points/kg
        - Metal: 25 points/kg
        - Plastic: 20 points/kg
        - Paper: 15 points/kg
        - Organic: 10 points/kg
        - Other: 5 points/kg
        """
        points_per_kg = {
            'e-waste': 50,
            'glass': 30,
            'metal': 25,
            'plastic': 20,
            'paper': 15,
            'wood/paper': 15,
            'organic': 10,
            'hazardous': 40,
            'other': 5
        }
        
        base_points = points_per_kg.get(waste_type.lower() if waste_type else 'other', 5)
        return int(base_points * (weight or 0))


class CollectionCenter(db.Model):
    """
    Represents a waste collection center
    """
    __tablename__ = "collection_centers"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    # Contact information
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    
    # Operating hours
    operating_hours = db.Column(db.JSON, nullable=True)  # {"monday": "8:00-17:00", ...}
    
    # Accepted waste types
    accepted_types = db.Column(db.JSON, nullable=True)  # ["plastic", "glass", "metal", ...]
    
    # Status
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<CollectionCenter {self.name}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'phone': self.phone,
            'email': self.email,
            'operating_hours': self.operating_hours,
            'accepted_types': self.accepted_types,
            'is_active': self.is_active
        }
