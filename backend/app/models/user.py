from sqlalchemy import Column, Integer, String, DateTime, func
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    user_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="civilian")  # 'civilian' or 'corporate'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    profile_image = Column(String(255), nullable=True)
    points = Column(Integer, default=0)  # for civilians (corporates can have 0)
    password_reset_token = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
