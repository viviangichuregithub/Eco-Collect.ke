"""
AI-powered waste classification service using deep learning
"""
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow import keras
from typing import Dict, Any
import json

class WasteClassifier:
    """
    Waste classification using pre-trained deep learning model
    """
    
    # Waste categories with their corresponding points
    WASTE_CATEGORIES = {
        'plastic': {'points': 10, 'description': 'Plastic waste (bottles, containers, packaging)'},
        'paper': {'points': 8, 'description': 'Paper and cardboard waste'},
        'glass': {'points': 12, 'description': 'Glass bottles and containers'},
        'metal': {'points': 15, 'description': 'Metal cans and containers'},
        'organic': {'points': 5, 'description': 'Organic/biodegradable waste'},
        'e-waste': {'points': 20, 'description': 'Electronic waste (batteries, devices)'},
        'mixed': {'points': 3, 'description': 'Mixed recyclable waste'},
        'non-recyclable': {'points': 0, 'description': 'Non-recyclable waste'}
    }
    
    def __init__(self, model_path=None):
        """
        Initialize the waste classifier
        
        Args:
            model_path: Path to pre-trained model (optional)
        """
        # Auto-detect model path if not provided
        if model_path is None:
            # Try common model locations
            possible_paths = [
                os.path.join(os.path.dirname(__file__), '../../models/waste_classifier_model.h5'),
                os.path.join(os.path.dirname(__file__), '../../waste_classifier_model.h5'),
                'models/waste_classifier_model.h5',
                'waste_classifier_model.h5'
            ]
            
            for path in possible_paths:
                abs_path = os.path.abspath(path)
                if os.path.exists(abs_path):
                    model_path = abs_path
                    print(f"✅ Found model at: {model_path}")
                    break
        
        self.model_path = model_path
        self.model = None
        self.img_size = (224, 224)  # Standard image size for most CNN models
        
        # Try to load model if path provided
        if model_path and os.path.exists(model_path):
            self._load_model()
        else:
            print("⚠️  No pre-trained model found. Using fallback classification logic.")
            print("   Run 'python create_model.py' to generate a model.")
    
    def _load_model(self):
        """Load pre-trained TensorFlow/Keras model"""
        try:
            self.model = keras.models.load_model(self.model_path)
            print(f"✅ Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"❌ Failed to load model: {str(e)}")
            self.model = None
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for model input
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array
        """
        # Load image
        img = Image.open(image_path)
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model input size
        img = img.resize(self.img_size)
        
        # Convert to array and normalize
        img_array = np.array(img) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    def analyze_image_features(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze image features when no model is available
        Uses heuristics based on color analysis and basic image processing
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with classification results
        """
        img = Image.open(image_path)
        img_rgb = img.convert('RGB')
        img_array = np.array(img_rgb)
        
        # Analyze dominant colors
        pixels = img_array.reshape(-1, 3)
        avg_color = np.mean(pixels, axis=0)
        
        # Simple heuristic-based classification
        # This is a fallback when no ML model is available
        r, g, b = avg_color
        
        # Color-based heuristics (simplified)
        if r > 150 and g < 100 and b < 100:
            # Reddish - might be plastic or metal
            waste_type = 'plastic'
            confidence = 75
        elif g > 150 and r < 120 and b < 120:
            # Greenish - might be glass or organic
            waste_type = 'glass'
            confidence = 70
        elif r > 200 and g > 200 and b > 200:
            # Whitish - might be paper
            waste_type = 'paper'
            confidence = 72
        elif r < 80 and g < 80 and b < 80:
            # Darkish - might be metal or e-waste
            waste_type = 'metal'
            confidence = 68
        else:
            # Default to mixed recyclable
            waste_type = 'mixed'
            confidence = 60
        
        return {
            'type': waste_type,
            'confidence': confidence,
            'points': self.WASTE_CATEGORIES[waste_type]['points'],
            'description': self.WASTE_CATEGORIES[waste_type]['description'],
            'avg_color': [int(r), int(g), int(b)]
        }
    
    def classify_with_model(self, image_path: str) -> Dict[str, Any]:
        """
        Classify image using trained ML model
        
        Args:
            image_path: Path to image file
            
        Returns:
            Classification results
        """
        # Preprocess image
        img_array = self.preprocess_image(image_path)
        
        # Get model predictions
        predictions = self.model.predict(img_array, verbose=0)[0]
        
        # Get top prediction
        category_idx = np.argmax(predictions)
        confidence = float(predictions[category_idx]) * 100
        
        # Map to waste category
        category_names = list(self.WASTE_CATEGORIES.keys())
        waste_type = category_names[min(category_idx, len(category_names) - 1)]
        
        return {
            'type': waste_type,
            'confidence': round(confidence, 1),
            'points': self.WASTE_CATEGORIES[waste_type]['points'],
            'description': self.WASTE_CATEGORIES[waste_type]['description'],
            'model': 'CNN-based'
        }
    
    def classify_image(self, image_path: str) -> Dict[str, Any]:
        """
        Main classification method - uses model if available, otherwise falls back
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with classification results including:
                - type: waste category
                - confidence: confidence percentage
                - points: points earned
                - description: waste description
        """
        try:
            if self.model is not None:
                # Use trained model
                result = self.classify_with_model(image_path)
            else:
                # Use heuristic-based analysis
                result = self.analyze_image_features(image_path)
            
            # Add metadata
            result['timestamp'] = tf.timestamp().numpy() if hasattr(tf, 'timestamp') else 0
            result['image_path'] = os.path.basename(image_path)
            
            # Add recommendations
            result['recommendations'] = self._get_recommendations(result['type'])
            
            return result
            
        except Exception as e:
            print(f"Classification error: {str(e)}")
            # Return default classification on error
            return {
                'type': 'mixed',
                'confidence': 50,
                'points': 3,
                'description': 'Mixed recyclable waste',
                'error': str(e),
                'recommendations': self._get_recommendations('mixed')
            }
    
    def _get_recommendations(self, waste_type: str) -> list:
        """
        Get recycling recommendations based on waste type
        
        Args:
            waste_type: Type of waste classified
            
        Returns:
            List of recommendation strings
        """
        recommendations = {
            'plastic': [
                'Clean and dry the plastic items',
                'Remove caps and labels if possible',
                'Crush bottles to save space'
            ],
            'paper': [
                'Keep paper dry and clean',
                'Remove any plastic wrapping',
                'Flatten cardboard boxes'
            ],
            'glass': [
                'Rinse containers thoroughly',
                'Remove lids and caps',
                'Keep different colors separated if possible'
            ],
            'metal': [
                'Rinse cans and containers',
                'Crush cans to save space',
                'Remove any non-metal parts'
            ],
            'organic': [
                'Consider composting if possible',
                'Separate from other waste types',
                'Use for garden fertilizer if suitable'
            ],
            'e-waste': [
                'Never mix with regular trash',
                'Remove batteries separately',
                'Take to specialized e-waste collection centers'
            ],
            'mixed': [
                'Try to separate different materials',
                'Clean items before recycling',
                'Check with collection center for guidelines'
            ],
            'non-recyclable': [
                'Dispose of properly according to local regulations',
                'Consider alternatives in the future',
                'Minimize this type of waste'
            ]
        }
        
        return recommendations.get(waste_type, ['Follow local recycling guidelines'])
