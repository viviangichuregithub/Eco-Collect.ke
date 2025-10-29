# AI Waste Classification API Documentation

## Overview
The AI Waste Classification API provides intelligent waste classification capabilities for the Eco-Collect.ke platform. Users can upload images of waste items and receive automatic classification with confidence scores, points calculation, and recycling recommendations.

## Base URL
```
https://api.ecocollect.ke/api
```

## Authentication
All endpoints require user authentication via session or X-User-ID header.

```http
Authorization: Bearer <session_token>
# OR
X-User-ID: <user_id>
```

## Image Upload & Classification API

### 1. Upload Photo
Upload a waste photo for classification.

**Endpoint:** `POST /uploads/photo`

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file` (required): Image file (PNG, JPG, JPEG, GIF, WEBP)
- Maximum file size: 10MB

**Request Example:**
```bash
curl -X POST https://api.ecocollect.ke/api/uploads/photo \
  -H "X-User-ID: 123" \
  -F "file=@waste_image.jpg"
```

**Response:**
```json
{
  "id": 1,
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "upload_timestamp": "2024-10-29T10:30:00Z",
  "message": "File uploaded successfully"
}
```

**Status Codes:**
- `201` - File uploaded successfully
- `400` - No file provided or invalid file type
- `401` - Unauthorized
- `413` - File size exceeds limit

---

### 2. Classify Waste
Analyze uploaded image using AI classification.

**Endpoint:** `POST /uploads/{file_id}/classify`

**Parameters:**
- `file_id` (path): UUID of uploaded file

**Request Example:**
```bash
curl -X POST https://api.ecocollect.ke/api/uploads/550e8400-e29b-41d4-a716-446655440000/classify \
  -H "X-User-ID: 123"
```

**Response:**
```json
{
  "type": "plastic",
  "confidence": 87,
  "points": 10,
  "description": "Plastic waste (bottles, containers, packaging)",
  "model_version": "heuristic_v1",
  "avg_color": [142, 168, 201],
  "analysis": {
    "brightness": 155,
    "saturation": 42,
    "color_variance": 35
  },
  "recommendations": [
    "Clean and dry the plastic items",
    "Remove caps and labels if possible",
    "Crush bottles to save space"
  ],
  "timestamp": 1698580800,
  "image_path": "550e8400.jpg"
}
```

**Waste Categories & Points:**
| Category | Points | Description |
|----------|--------|-------------|
| `plastic` | 10 | Plastic waste (bottles, containers, packaging) |
| `paper` | 8 | Paper and cardboard waste |
| `glass` | 12 | Glass bottles and containers |
| `metal` | 15 | Metal cans and containers |
| `mixed` | 5 | Mixed recyclable waste |

**Status Codes:**
- `200` - Classification successful
- `404` - Upload not found
- `500` - Classification failed

---

### 3. Submit Upload
Submit classified upload with additional details.

**Endpoint:** `PATCH /uploads/{file_id}/submit`

**Content-Type:** `application/json`

**Parameters:**
- `file_id` (path): UUID of uploaded file

**Request Body:**
```json
{
  "weight": 0.5,
  "collection_center_id": 1,
  "notes": "Plastic water bottle in good condition",
  "location": {
    "latitude": -1.2921,
    "longitude": 36.8219,
    "address": "Nairobi, Kenya"
  }
}
```

**Response:**
```json
{
  "message": "Submission successful",
  "upload": {
    "id": 1,
    "file_id": "550e8400-e29b-41d4-a716-446655440000",
    "waste_type": "plastic",
    "weight": 0.5,
    "confidence_score": 0.87,
    "points_earned": 10,
    "status": "pending",
    "submitted_at": "2024-10-29T10:35:00Z"
  },
  "points_earned": 10
}
```

**Status Codes:**
- `200` - Submission successful
- `403` - Unauthorized (not owner)
- `404` - Upload not found

---

### 4. Get Upload Details
Retrieve details of a specific upload.

**Endpoint:** `GET /uploads/{file_id}`

**Parameters:**
- `file_id` (path): UUID of uploaded file

**Response:**
```json
{
  "id": 1,
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400.jpg",
  "waste_type": "plastic",
  "weight": 0.5,
  "confidence_score": 0.87,
  "points_earned": 10,
  "status": "pending",
  "uploaded_at": "2024-10-29T10:30:00Z",
  "submitted_at": "2024-10-29T10:35:00Z",
  "classification_details": {
    "type": "plastic",
    "confidence": 87,
    "recommendations": ["..."]
  },
  "user": {
    "id": 123,
    "username": "john_doe"
  }
}
```

---

### 5. Delete Upload
Soft delete an uploaded file.

**Endpoint:** `DELETE /uploads/{file_id}`

**Parameters:**
- `file_id` (path): UUID of uploaded file

**Response:**
```json
{
  "message": "Upload deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted successfully
- `403` - Unauthorized (not owner)
- `404` - Upload not found

---

### 6. Get User Upload History
Retrieve user's upload history with pagination and filtering.

**Endpoint:** `GET /uploads/user/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `status` (optional): Filter by status (pending, approved, rejected)
- `type` (optional): Filter by waste type (plastic, paper, glass, metal, mixed)

**Request Example:**
```bash
curl "https://api.ecocollect.ke/api/uploads/user/history?page=1&limit=5&status=approved&type=plastic" \
  -H "X-User-ID: 123"
```

**Response:**
```json
{
  "uploads": [
    {
      "id": 1,
      "file_id": "550e8400-e29b-41d4-a716-446655440000",
      "waste_type": "plastic",
      "weight": 0.5,
      "status": "approved",
      "points_earned": 10,
      "uploaded_at": "2024-10-29T10:30:00Z",
      "confidence_score": 0.87
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

---

## Submissions API

### 7. Create Submission
Create a new waste submission from an uploaded file.

**Endpoint:** `POST /submissions`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "weight": 0.5,
  "collection_center_id": 1,
  "notes": "Clean plastic bottle",
  "location": {
    "latitude": -1.2921,
    "longitude": 36.8219,
    "address": "Nairobi, Kenya"
  },
  "classification": {
    "type": "plastic",
    "confidence": 87,
    "points": 10
  }
}
```

**Response:**
```json
{
  "id": 1,
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "points_earned": 10,
  "status": "pending",
  "message": "Submission created successfully"
}
```

---

### 8. Get Submission History
Retrieve user's submission history with pagination.

**Endpoint:** `GET /submissions/history`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)
- `status` (optional): Filter by status
- `type` (optional): Filter by waste type

**Response:**
```json
{
  "submissions": [
    {
      "id": 1,
      "file_id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "plastic",
      "weight": "0.5 kg",
      "center": "Downtown Collection Center",
      "status": "pending",
      "points": 10,
      "date": "2024-10-29 10:35",
      "confidence": "87%",
      "notes": "Clean plastic bottle"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "pages": 2
}
```

---

### 9. Get Submission Details
Get detailed information about a specific submission.

**Endpoint:** `GET /submissions/{submission_id}`

**Parameters:**
- `submission_id` (path): ID of submission

**Response:**
```json
{
  "id": 1,
  "file_id": "550e8400-e29b-41d4-a716-446655440000",
  "waste_type": "plastic",
  "weight": 0.5,
  "status": "pending",
  "points_earned": 10,
  "submitted_at": "2024-10-29T10:35:00Z",
  "classification_details": {
    "type": "plastic",
    "confidence": 87,
    "recommendations": ["Clean and dry", "Remove labels"]
  },
  "location": {
    "latitude": -1.2921,
    "longitude": 36.8219,
    "address": "Nairobi, Kenya"
  },
  "user": {
    "id": 123,
    "username": "john_doe"
  }
}
```

---

### 10. Update Submission Status (Admin)
Update the status of a submission.

**Endpoint:** `PATCH /submissions/{submission_id}/status`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Good quality submission"
}
```

**Parameters:**
- `status`: pending, approved, rejected

**Response:**
```json
{
  "message": "Status updated successfully",
  "submission": {
    "id": 1,
    "status": "approved",
    "reviewed_at": "2024-10-29T11:00:00Z",
    "points_status": "awarded"
  }
}
```

---

## AI Classification Details

### Classification Algorithm
The AI system uses a hybrid approach:

1. **Heuristic Analysis** (Default):
   - Color-based classification using RGB analysis
   - Brightness and saturation metrics
   - Pattern recognition for common waste types

2. **Deep Learning** (Optional):
   - TensorFlow/Keras CNN model
   - Pre-trained on waste image datasets
   - Image preprocessing: 224x224 RGB normalization

### Confidence Scoring
- **High Confidence (80-95%)**: Clear classification with distinctive features
- **Medium Confidence (60-79%)**: Reasonable classification with some uncertainty
- **Low Confidence (40-59%)**: Best guess with significant uncertainty
- **Very Low (<40%)**: Defaults to "mixed" category

### Points System
Points are calculated based on:
- **Base Points**: Category-specific values
- **Weight Multiplier**: Points × weight (kg)
- **Quality Bonus**: Clean, well-separated items get bonus points

### Recommendations Engine
Each waste type includes specific recycling tips:
- Preparation instructions
- Collection guidelines
- Environmental impact information

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2024-10-29T10:30:00Z"
}
```

### Common Error Codes
- `INVALID_FILE_TYPE`: Unsupported file format
- `FILE_TOO_LARGE`: File exceeds size limit
- `CLASSIFICATION_FAILED`: AI processing error
- `UPLOAD_NOT_FOUND`: File ID not found
- `UNAUTHORIZED`: Authentication required
- `PERMISSION_DENIED`: Access denied

---

## Rate Limits
- **Upload**: 50 files per hour per user
- **Classification**: 100 requests per hour per user
- **History**: 1000 requests per hour per user

## File Storage
- **Location**: AWS S3 or local storage
- **Retention**: Images stored for 90 days
- **Security**: UUID-based filenames, no public access
- **Cleanup**: Automatic deletion of old files

## SDKs and Libraries

### JavaScript/Node.js
```javascript
const EcoCollectAPI = require('@ecocollect/api-client');

const api = new EcoCollectAPI({
  baseURL: 'https://api.ecocollect.ke/api',
  apiKey: 'your-api-key'
});

// Upload and classify
const result = await api.uploads.uploadAndClassify(imageFile);
console.log(`Classified as: ${result.type} (${result.confidence}% confidence)`);
```

### Python
```python
from ecocollect import APIClient

client = APIClient(
    base_url='https://api.ecocollect.ke/api',
    api_key='your-api-key'
)

# Upload and classify
result = client.uploads.upload_and_classify('waste_image.jpg')
print(f"Classified as: {result['type']} ({result['confidence']}% confidence)")
```

### cURL Examples
```bash
# Complete workflow
# 1. Upload
UPLOAD_RESPONSE=$(curl -s -X POST https://api.ecocollect.ke/api/uploads/photo \
  -H "X-User-ID: 123" \
  -F "file=@image.jpg")

FILE_ID=$(echo $UPLOAD_RESPONSE | jq -r '.file_id')

# 2. Classify
curl -X POST https://api.ecocollect.ke/api/uploads/$FILE_ID/classify \
  -H "X-User-ID: 123"

# 3. Submit
curl -X PATCH https://api.ecocollect.ke/api/uploads/$FILE_ID/submit \
  -H "X-User-ID: 123" \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.5, "collection_center_id": 1}'
```

---

## Webhooks (Future Feature)
Configure webhooks to receive real-time notifications:

```json
{
  "event": "classification.completed",
  "data": {
    "file_id": "550e8400-e29b-41d4-a716-446655440000",
    "classification": {
      "type": "plastic",
      "confidence": 87
    }
  },
  "timestamp": "2024-10-29T10:30:00Z"
}
```

---

## Testing

### Test Images
Use these sample classifications for testing:
- **Blue plastic bottle** → plastic (85% confidence)
- **Cardboard box** → paper (78% confidence)
- **Green glass bottle** → glass (82% confidence)
- **Aluminum can** → metal (90% confidence)

### Postman Collection
Download our Postman collection: [eco-collect-ai-api.json](https://api.ecocollect.ke/docs/postman)

### Sandbox Environment
Test endpoint: `https://sandbox-api.ecocollect.ke/api`
- No authentication required
- Fake data responses
- All endpoints available

---

## Support

**Documentation**: https://docs.ecocollect.ke/ai-api
**Support Email**: api-support@ecocollect.ke
**Status Page**: https://status.ecocollect.ke
**GitHub Issues**: https://github.com/ecocollect/api/issues

---

## Changelog

### v1.2.0 (2024-10-29)
- Added submission history filtering
- Improved classification confidence scoring
- Added batch upload support

### v1.1.0 (2024-10-15)
- Enhanced error handling
- Added recommendation system
- Implemented rate limiting

### v1.0.0 (2024-10-01)
- Initial release
- Basic upload and classification
- Points calculation system

---

*Built with ♻️ by the Eco-Collect.ke Team*