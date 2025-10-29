from datetime import datetime
from app.extensions import db

class Upload(db.Model):
    __tablename__ = "uploads"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user_name = db.Column(db.String(120), nullable=False)
    filename_url = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(120), nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    weight = db.Column(db.Float, nullable=True)
    points_awarded = db.Column(db.Integer, default=0)
    not_verified = db.Column(db.Boolean, default=True)
    centre_id = db.Column(db.Integer, db.ForeignKey("centers.id"), nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Upload {self.id} - {self.user_name} ({self.category})>"
