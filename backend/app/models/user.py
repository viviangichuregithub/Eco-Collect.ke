from datetime import datetime
from app import db, bcrypt

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    role = db.Column(db.String(50), nullable=False, default="civilian") 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    password_hashed = db.Column(db.String(255), nullable=False)
    terms_approved = db.Column(db.Boolean, default=False)
    password_reset_token = db.Column(db.String(255), nullable=True)

    point_score = db.Column(db.Integer, default=0)

    profile_image = db.Column(db.Text, nullable=True)

    # Profile fields
    phone = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)

    def set_password(self, password: str) -> None:
        self.password_hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hashed, password)

    def add_points(self, points: int) -> None:
        if self.role == "civilian":
            self.point_score += points
            db.session.commit()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.user_name,
            "email": self.email,
            "phone": self.phone or "",
            "location": self.location or "",
            "bio": self.bio or "",
            "avatar": self.profile_image, 
            "memberSince": self.created_at.strftime("%B %Y"),
            "points": self.point_score
        }

    def __repr__(self):
        return f"<User {self.user_name} ({self.role})>"