from datetime import datetime
from typing import Optional, Dict, Any
from app import db

class centers(db.Model):
    """
    Centre model.

    Fields:
      - id: primary key
      - location: human-readable address/label
      - location_url: optional Google Maps URL or place link
      - created_by: foreign key to users.id (assumes a users table exists)
      - created_at: timestamp (UTC)
      - total_waste_collected: integer (default 0)
      - time_open: free-form opening hours
      - contact: phone number as string (keeps + and leading zeros)
    """

    __tablename__ = "centers"

    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(255), nullable=False)
    location_url = db.Column(db.String(500), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    total_waste_collected = db.Column(db.Integer, default=0, nullable=False)
    time_open = db.Column(db.String(255), nullable=True)
    contact = db.Column(db.String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<Centre id={self.id} location={self.location!r}>"

    def to_dict(self) -> Dict[str, Any]:
        """Return JSON-serializable representation."""
        return {
            "id": self.id,
            "location": self.location,
            "location_url": self.location_url,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "total_waste_collected": self.total_waste_collected,
            "time_open": self.time_open,
            "contact": self.contact,
        }

    @staticmethod
    def _normalize_contact(contact: Optional[str]) -> Optional[str]:
        """
        Normalize contact by keeping digits and a leading plus sign.
        Returns None for empty input.
        """
        if not contact:
            return None
        contact = contact.strip()
        # keep only + and digits
        allowed = "+0123456789"
        normalized = "".join(ch for ch in contact if ch in allowed)
        return normalized or None

    @classmethod
    def create(
        cls,
        location: str,
        created_by: int,
        location_url: Optional[str] = None,
        time_open: Optional[str] = None,
        contact: Optional[str] = None,
        total_waste_collected: int = 0,
        commit: bool = True,
    ) -> "centers":
        """
        Create, add and (optionally) commit a new centre.

        Example:
            Centre.create(
                location="Nairobi Market",
                created_by=1,
                contact="+254700000000",
                time_open="Mon-Fri 09:00-17:00",
                location_url="https://maps.google.com/..."
            )
        """
        # normalize contact
        contact_norm = cls._normalize_contact(contact)

        centre = cls(
            location=location,
            created_by=created_by,
            location_url=location_url,
            time_open=time_open,
            contact=contact_norm,
            total_waste_collected=total_waste_collected,
        )
        db.session.add(centre)
        if commit:
            db.session.commit()
        return centre

    @classmethod
    def create_from_dict(cls, data: Dict[str, Any], commit: bool = True) -> "centers":
        allowed = {
            "location",
            "created_by",
            "location_url",
            "time_open",
            "contact",
            "total_waste_collected",
        }
        payload = {k: data[k] for k in data if k in allowed}
        # required field check
        if "location" not in payload:
            raise ValueError("`location` is required")
        if "created_by" not in payload:
            raise ValueError("`created_by` is required")

        return cls.create(commit=commit, **payload)  # type: ignore[arg-type]

    def update_from_dict(self, data: Dict[str, Any], commit: bool = True) -> "centers":
        allowed = {
            "location",
            "location_url",
            "time_open",
            "contact",
            "total_waste_collected",
        }
        for k, v in data.items():
            if k not in allowed:
                continue
            if k == "contact":
                v = self._normalize_contact(v)
            setattr(self, k, v)
        if commit:
            db.session.commit()
        return self
