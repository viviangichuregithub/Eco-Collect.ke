# Database Models Documentation

## Overview
The EcoCollect backend uses SQLAlchemy ORM with SQLite (development) / PostgreSQL (production) for data persistence.

## Models

### 1. User Model (`app/models/user.py`)
Manages user accounts, authentication, and points.

**Fields:**
- `id` (Integer, PK): Unique user identifier
- `user_name` (String): Unique username
- `email` (String): Unique email address (indexed)
- `role` (String): User role (civilian/corporative/admin)
- `password_hashed` (String): Bcrypt password hash
- `point_score` (Integer): Total reward points earned
- `profile_image` (String): Profile image URL
- `created_at` (DateTime): Account creation timestamp
- `terms_approved` (Boolean): Terms acceptance status
- `password_reset_token` (String): Password reset token

**Relationships:**
- `uploads`: One-to-many with Upload model
- `reviewed_uploads`: Uploads reviewed by this user (admin only)

**Methods:**
- `set_password(password)`: Hash and store password
- `check_password(password)`: Verify password
- `add_points(points)`: Add reward points (civilians only)

---

### 2. Upload Model (`app/models/uploads.py`)
Tracks waste photo uploads with AI classification and submission details.

**Fields:**

**Identity:**
- `id` (Integer, PK): Database ID
- `file_id` (String, Unique, Indexed): UUID for file identification
- `user_id` (Integer, FK → users.id, Indexed): Owner of upload

**File Information:**
- `filename` (String): Original filename
- `file_path` (String): Absolute path on disk
- `file_size` (Integer): Size in bytes
- `mime_type` (String): MIME type (e.g., image/jpeg)

**AI Classification:**
- `waste_type` (String): Classified type (plastic/glass/metal/paper/organic/e-waste/hazardous/other)
- `confidence_score` (Float): AI confidence (0.0 to 1.0)
- `ai_model_version` (String): Model version used
- `classification_details` (JSON): Full AI response data

**Submission Details:**
- `weight` (Float): Weight in kilograms
- `collection_center_id` (Integer, FK → collection_centers.id): Selected collection center
- `notes` (Text): User's description/notes

**Location:**
- `latitude` (Float): GPS latitude
- `longitude` (Float): GPS longitude
- `location_address` (String): Reverse-geocoded address

**Status & Review:**
- `status` (String, Indexed): pending/approved/rejected/processing
- `points_earned` (Integer): Points awarded for this upload
- `points_status` (String): pending/awarded/rejected
- `reviewed_by` (Integer, FK → users.id): Admin who reviewed
- `review_notes` (Text): Admin's review comments
- `reviewed_at` (DateTime): Review timestamp

**Timestamps:**
- `uploaded_at` (DateTime, Indexed): File upload time
- `classified_at` (DateTime): AI classification time
- `submitted_at` (DateTime): Form submission time
- `updated_at` (DateTime): Last update time

**Soft Delete:**
- `is_deleted` (Boolean, Indexed): Deletion flag
- `deleted_at` (DateTime): Deletion timestamp

**Relationships:**
- `user`: Many-to-one with User (uploader)
- `reviewer`: Many-to-one with User (reviewer)
- `collection_center`: Many-to-one with CollectionCenter

**Methods:**
- `to_dict(include_user=False)`: Convert to JSON-serializable dict
- `calculate_points(waste_type, weight)`: Static method to calculate points

**Points Calculation:**
```python
Points per kg:
- E-waste: 50 points/kg
- Hazardous: 40 points/kg
- Glass: 30 points/kg
- Metal: 25 points/kg
- Plastic: 20 points/kg
- Paper/Wood: 15 points/kg
- Organic: 10 points/kg
- Other: 5 points/kg
```

---

### 3. CollectionCenter Model (`app/models/uploads.py`)
Represents waste collection/recycling centers.

**Fields:**
- `id` (Integer, PK): Center identifier
- `name` (String): Center name
- `address` (String): Physical address
- `latitude` (Float): GPS latitude
- `longitude` (Float): GPS longitude
- `phone` (String): Contact phone number
- `email` (String): Contact email
- `operating_hours` (JSON): Operating hours by day
- `accepted_types` (JSON): List of accepted waste types
- `is_active` (Boolean, Indexed): Active status
- `created_at` (DateTime): Creation timestamp
- `updated_at` (DateTime): Last update timestamp

**Relationships:**
- `uploads`: One-to-many with Upload model

**Methods:**
- `to_dict()`: Convert to JSON-serializable dict

**Sample Data:**
```json
{
  "name": "Nairobi Central Recycling Hub",
  "address": "CBD, Kenyatta Avenue, Nairobi",
  "latitude": -1.286389,
  "longitude": 36.817223,
  "phone": "+254712345678",
  "email": "cbd@ecocollect.ke",
  "operating_hours": {
    "monday": "8:00-17:00",
    "tuesday": "8:00-17:00",
    ...
  },
  "accepted_types": ["plastic", "glass", "metal", "paper", "e-waste"]
}
```

---

## Database Setup

### 1. Create Database Tables
```bash
cd backend
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"
```

### 2. Seed Collection Centers
```bash
python seed_centers.py
```

### 3. Create Migrations (Optional)
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

## API Endpoints Using These Models

### Upload Endpoints (`/api/uploads`)

**POST /photo**
- Creates Upload record
- Saves file to disk
- Returns file_id for classification

**POST /<file_id>/classify**
- Updates Upload with AI classification results
- Stores waste_type, confidence_score, classification_details

**PATCH /<file_id>/submit**
- Updates Upload with form data (weight, center, notes, location)
- Calculates and assigns points
- Sets status to 'pending'

**GET /<file_id>**
- Retrieves Upload details

**DELETE /<file_id>**
- Soft deletes Upload (sets is_deleted=True)

**GET /user/history**
- Paginated list of user's uploads
- Supports filtering by status, waste_type

### Submission Endpoints (`/api/submissions`)

**POST /**
- Alternative endpoint for creating submissions
- Finds Upload by file_id and updates it

**GET /history**
- Retrieves submitted uploads (submitted_at is not NULL)
- Paginated with filters

**GET /<id>**
- Get specific submission details

**PATCH /<id>/status**
- Update submission status (admin)
- Award/reject points based on status

---

## Database Schema Diagram

```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ user_name       │
│ email           │
│ role            │
│ point_score     │
└────────┬────────┘
         │
         │ user_id (FK)
         │
         ▼
┌─────────────────────────────┐
│         Upload              │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │◄────┐
│ file_id (UUID)              │     │
│ filename                    │     │
│ waste_type                  │     │
│ confidence_score            │     │
│ weight                      │     │
│ collection_center_id (FK)   ├─────┤
│ status                      │     │
│ points_earned               │     │
│ reviewed_by (FK)            ├─────┘
│ submitted_at                │
│ is_deleted                  │
└──────────┬──────────────────┘
           │
           │ collection_center_id (FK)
           │
           ▼
┌─────────────────────────┐
│   CollectionCenter      │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ address                 │
│ latitude                │
│ longitude               │
│ operating_hours (JSON)  │
│ accepted_types (JSON)   │
│ is_active               │
└─────────────────────────┘
```

---

## Workflow Example

### 1. User Uploads Photo
```python
# POST /api/uploads/photo
upload = Upload(
    user_id=current_user.id,
    file_id="abc-123-uuid",
    filename="bottle.jpg",
    file_path="/path/to/abc-123-uuid.jpg",
    status="pending"
)
db.session.add(upload)
db.session.commit()
```

### 2. AI Classifies Image
```python
# POST /api/uploads/abc-123-uuid/classify
upload.waste_type = "plastic"
upload.confidence_score = 0.85
upload.classified_at = datetime.utcnow()
db.session.commit()
```

### 3. User Submits Form
```python
# PATCH /api/uploads/abc-123-uuid/submit
upload.weight = 1.5
upload.collection_center_id = 1
upload.points_earned = Upload.calculate_points("plastic", 1.5)  # 20 * 1.5 = 30
upload.submitted_at = datetime.utcnow()
db.session.commit()
```

### 4. Admin Reviews
```python
# PATCH /api/submissions/1/status
upload.status = "approved"
upload.points_status = "awarded"
upload.reviewed_by = admin.id
upload.reviewed_at = datetime.utcnow()

# Award points to user
user = User.query.get(upload.user_id)
user.add_points(upload.points_earned)

db.session.commit()
```

---

## Data Integrity

### Foreign Key Constraints
- Upload.user_id → User.id
- Upload.reviewed_by → User.id
- Upload.collection_center_id → CollectionCenter.id

### Indexes
- User.email (unique index for fast lookups)
- Upload.file_id (unique index for UUID lookups)
- Upload.user_id (index for user history queries)
- Upload.status (index for filtering)
- Upload.uploaded_at (index for sorting)
- Upload.is_deleted (index for soft delete queries)
- CollectionCenter.is_active (index for filtering)

### Cascading Deletes
- Currently using soft deletes for Uploads
- Physical deletes should be handled with care
- Consider CASCADE vs SET NULL vs RESTRICT for foreign keys

---

## Production Considerations

### 1. Database Migration
```bash
# Switch to PostgreSQL in production
DATABASE_URL=postgresql://user:password@localhost/ecocollect
```

### 2. Indexing Strategy
- Add composite indexes for common queries:
  ```sql
  CREATE INDEX idx_uploads_user_status ON uploads(user_id, status);
  CREATE INDEX idx_uploads_user_submitted ON uploads(user_id, submitted_at);
  ```

### 3. File Storage
- Move from local filesystem to cloud storage (S3, Azure Blob)
- Update file_path to store cloud URLs

### 4. Backup Strategy
- Regular database backups
- Point-in-time recovery
- File storage backups

### 5. Performance
- Connection pooling
- Query optimization
- Caching frequently accessed data (collection centers)

---

## Testing

### Create Test User
```python
from app.models.user import User
user = User(user_name="test", email="test@test.com", role="civilian")
user.set_password("test123")
db.session.add(user)
db.session.commit()
```

### Create Test Upload
```python
from app.models.uploads import Upload
upload = Upload(
    user_id=1,
    file_id="test-uuid",
    filename="test.jpg",
    file_path="/path/to/test.jpg",
    waste_type="plastic",
    weight=1.0,
    status="pending"
)
db.session.add(upload)
db.session.commit()
```

### Query Examples
```python
# Get all uploads for a user
uploads = Upload.query.filter_by(user_id=1, is_deleted=False).all()

# Get pending submissions
pending = Upload.query.filter_by(
    status='pending',
    is_deleted=False
).filter(
    Upload.submitted_at.isnot(None)
).all()

# Get user's total points from approved uploads
total_points = db.session.query(
    db.func.sum(Upload.points_earned)
).filter_by(
    user_id=1,
    status='approved'
).scalar()
```
