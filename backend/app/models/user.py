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

    profile_image = db.Column(db.String(500), nullable=True)

    def set_password(self, password: str) -> None:
        """Hashes and sets the user's password."""
        self.password_hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verifies a password against the stored hash."""
        return bcrypt.check_password_hash(self.password_hashed, password)

    def add_points(self, points: int) -> None:
        """Adds reward points (for civilians)."""
        if self.role == "civilian":
            self.point_score += points
            db.session.commit()

    def __repr__(self):
        return f"<User {self.user_name} ({self.role})>"
