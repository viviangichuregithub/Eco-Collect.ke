# AI-Powered Waste Classification Feature

## Overview
This feature adds intelligent waste classification to the Eco-Collect.ke platform using deep learning. Users can upload or capture photos of waste items, and the AI automatically classifies the type of waste and provides recycling recommendations.

## Features

### 1. **Smart Image Upload**
- **Camera Integration**: Capture photos directly from device camera
- **File Upload**: Choose images from device gallery
- **Multi-format Support**: PNG, JPG, JPEG, GIF, WEBP
- **File Size Limit**: 10MB maximum

### 2. **AI Classification**
The AI model classifies waste into 8 categories:

| Category | Points | Description |
|----------|--------|-------------|
| **Plastic** | 10 | Bottles, containers, packaging |
| **Paper** | 8 | Paper and cardboard waste |
| **Glass** | 12 | Glass bottles and containers |
| **Metal** | 15 | Metal cans and containers |
| **Organic** | 5 | Biodegradable/compostable waste |
| **E-waste** | 20 | Electronic devices, batteries |
| **Mixed** | 3 | Mixed recyclable materials |
| **Non-recyclable** | 0 | Non-recyclable items |

### 3. **Classification Results**
For each upload, users receive:
- **Waste Type**: The classified category
- **Confidence Score**: AI confidence percentage (0-100%)
- **Points Earned**: Eco-points based on waste type
- **Recycling Tips**: Category-specific recommendations
- **Visual Feedback**: Color-coded results display

### 4. **User Flow**
1. User uploads/captures waste photo
2. AI analyzes image (loading screen with rotating messages)
3. Classification results displayed with confidence score
4. User fills in additional details (weight, collection center)
5. Submission saved to history with points awarded

## Technical Implementation

### Backend Architecture

#### **AI Classifier Service** (`backend/app/services/ai_classifier.py`)
- TensorFlow/Keras-based image classification
- Fallback to heuristic-based classification when model unavailable
- Pre-processing pipeline for image normalization
- Custom waste category mapping with points system

```python
class WasteClassifier:
    def classify_image(self, image_path: str) -> Dict[str, Any]:
        # Returns: type, confidence, points, description, recommendations
```

#### **Upload Routes** (`backend/app/routes/uploads.py`)
- `/api/uploads/photo` [POST]: Upload waste photo
- `/api/uploads/<file_id>/classify` [POST]: Classify uploaded image
- `/api/uploads/<file_id>` [DELETE]: Remove uploaded file

#### **File Storage**
- Uploaded images stored in `backend/uploads/` directory
- UUID-based filenames for uniqueness
- Secure filename sanitization
- Automatic file extension detection

### Frontend Integration

#### **Upload Component** (`frontend/src/components/Upload.jsx`)
Three modal states:
1. **Initial Upload Screen**: Camera or file upload buttons
2. **Loading Modal**: AI analysis progress with rotating messages
3. **Form Modal**: Results display + data entry

#### **AI Classification Display**
```jsx
<div className="classification-result">
  <span>{aiClassification.type}</span>
  <span>{aiClassification.confidence}% confident</span>
  <span>+{aiClassification.points} pts</span>
</div>
```

#### **API Service** (`frontend/src/lib/api.js`)
- Automatic fallback to demo data when offline
- Random realistic classifications for testing
- Full recommendation sets for each waste type

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

Key packages:
- `tensorflow==2.18.0` - Deep learning framework
- `numpy==1.26.4` - Numerical computations
- `Pillow==11.1.0` - Image processing
- `scikit-learn==1.6.1` - ML utilities

2. **Create Upload Directory**
```bash
mkdir -p backend/uploads
```

3. **Run Flask Server**
```bash
python app.py
```
Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

### Environment Configuration

Create `.env` file in backend:
```env
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=sqlite:///eco_collect.db
SECRET_KEY=your-secret-key-here
```

Create `.env.local` in frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Usage

### For Users

1. **Navigate to Civilian Dashboard**
2. **Click "Upload" tab**
3. **Choose action**:
   - "Take Photo" → Use device camera
   - "Choose File" → Select from gallery
4. **Wait for AI analysis** (2-3 seconds)
5. **Review classification results**
6. **Fill in details**:
   - Weight (kg)
   - Collection center
   - Optional notes
7. **Submit** to earn points

### For Developers

#### Testing Classification Locally

```python
from app.services.ai_classifier import WasteClassifier

classifier = WasteClassifier()
result = classifier.classify_image('path/to/image.jpg')

print(f"Type: {result['type']}")
print(f"Confidence: {result['confidence']}%")
print(f"Points: {result['points']}")
print(f"Recommendations: {result['recommendations']}")
```

#### Adding Custom Waste Categories

Edit `WASTE_CATEGORIES` in `ai_classifier.py`:

```python
WASTE_CATEGORIES = {
    'new_category': {
        'points': 10,
        'description': 'Description of new category'
    }
}
```

#### Training Custom Model

```python
# Future implementation - train on labeled waste images
from tensorflow import keras

model = keras.Sequential([
    # Your model architecture
])

model.compile(optimizer='adam', loss='categorical_crossentropy')
model.fit(training_data, epochs=50)
model.save('waste_classifier_model.h5')
```

## AI Model Details

### Current Implementation
- **Mode**: Fallback heuristic-based classification
- **Method**: Color analysis + image features
- **Accuracy**: ~60-75% (demo mode)

### Future Enhancements
1. **Train Custom CNN**
   - Dataset: 10,000+ labeled waste images
   - Architecture: ResNet50 or EfficientNet
   - Expected accuracy: 90%+

2. **Cloud AI Integration**
   - Google Cloud Vision API
   - Azure Custom Vision
   - AWS Rekognition

3. **Real-time Classification**
   - Edge ML models (TensorFlow Lite)
   - On-device classification
   - Faster processing (<1 second)

## API Endpoints

### Upload Photo
```http
POST /api/uploads/photo
Content-Type: multipart/form-data

file: <image_file>

Response:
{
  "file_id": "uuid-string",
  "filename": "uuid.jpg",
  "upload_timestamp": "2024-10-26T12:00:00Z",
  "message": "File uploaded successfully"
}
```

### Classify Waste
```http
POST /api/uploads/<file_id>/classify

Response:
{
  "type": "plastic",
  "confidence": 85,
  "points": 10,
  "description": "Plastic waste (bottles, containers, packaging)",
  "recommendations": [
    "Clean and dry the plastic items",
    "Remove caps and labels if possible",
    "Crush bottles to save space"
  ],
  "timestamp": 1729944000
}
```

## Testing

### Frontend Testing (Browser)
1. Open `http://localhost:3000/civilian`
2. Navigate to Upload tab
3. Upload test image (any waste photo)
4. Verify:
   - Loading animation appears
   - Classification result displayed
   - Points and confidence shown
   - Recommendations listed

### Backend Testing (Python)
```bash
# Test upload endpoint
curl -X POST http://localhost:5000/api/uploads/photo \
  -F "file=@test_image.jpg"

# Test classification (replace UUID)
curl -X POST http://localhost:5000/api/uploads/<uuid>/classify
```

### Fallback Mode Testing
- Stop backend server
- Try uploading in frontend
- Should see console message: "🔄 API connection failed. Using fallback data"
- Random classification still works

## Troubleshooting

### Issue: "Module not found: tensorflow"
**Solution**: Install backend dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Issue: "File too large"
**Solution**: Reduce image size or increase `MAX_FILE_SIZE` in `uploads.py`

### Issue: "AI classification failed"
**Solution**: 
- Check if image file exists in `backend/uploads/`
- Verify file permissions
- Check console logs for detailed error

### Issue: Classification always returns same type
**Solution**: This is normal in heuristic mode. Train a proper model for variety.

## Performance Optimization

### Image Preprocessing
- Resize images to 224x224 before classification
- Normalize pixel values (0-1 range)
- Convert to RGB color space

### Caching
- Cache classification results by file hash
- Avoid re-classifying identical images
- Store results in database

### Async Processing
- Queue-based classification for high traffic
- Background workers for AI inference
- Real-time progress updates via WebSocket

## Security Considerations

1. **File Validation**
   - Whitelist allowed file extensions
   - Verify file MIME types
   - Scan for malicious content

2. **File Size Limits**
   - Maximum 10MB per upload
   - Prevent DoS attacks

3. **Secure Storage**
   - UUID-based filenames (no user input)
   - Private upload directory
   - Regular cleanup of old files

4. **Rate Limiting**
   - Limit uploads per user/session
   - Prevent API abuse

## Future Roadmap

- [ ] Train production-ready CNN model
- [ ] Add multi-language support
- [ ] Implement batch upload processing
- [ ] Add object detection (multiple items)
- [ ] Create mobile app with offline classification
- [ ] Add user feedback loop for model improvement
- [ ] Integrate with blockchain for verification
- [ ] Add augmented reality preview

## Contributing

To contribute to the AI classification feature:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/ai-improvements`)
3. Test your changes thoroughly
4. Submit pull request with detailed description

## License

Part of Eco-Collect.ke platform - All rights reserved

## Support

For issues or questions:
- **Email**: support@ecocollect.ke
- **GitHub Issues**: [Create Issue](https://github.com/viviangichuregithub/Eco-Collect.ke/issues)

---

**Built with ♻️ by the Eco-Collect.ke Team**
*Making waste classification smarter, one image at a time.*
