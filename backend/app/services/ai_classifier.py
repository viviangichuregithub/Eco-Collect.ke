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
        'metal': {'points': 15, 'description': 'Metal cans and containers'}
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
        Uses advanced heuristics based on color analysis, texture, and brightness
        
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
        std_color = np.std(pixels, axis=0)
        
        r, g, b = avg_color
        r_std, g_std, b_std = std_color
        
        # Calculate brightness and saturation
        brightness = (r + g + b) / 3
        saturation = np.max(std_color)
        color_variance = np.mean(std_color)
        
        # Calculate color ratios for better classification
        total = r + g + b + 1  # Avoid division by zero
        r_ratio = r / total
        g_ratio = g / total
        b_ratio = b / total
        
        # Score each waste type with REALISTIC conditions for actual photos
        scores = {}
        
        # PLASTIC (colorful, bright, or translucent bottles/containers)
        plastic_score = 0
        # Bright colored plastics
        if brightness > 120 and saturation > 30:
            plastic_score += 50
        # Blue plastics (water bottles)
        if b > r and b > g and b_ratio > 0.34:
            plastic_score += 55
        # Red/pink plastics
        if r > g and r > b and r_ratio > 0.35 and brightness > 100:
            plastic_score += 50
        # Green/yellow plastics
        if g > r and g > b and g_ratio > 0.34 and brightness > 100:
            plastic_score += 45
        # Clear/translucent plastics
        if brightness > 160 and saturation < 50:
            plastic_score += 40
        # Medium brightness, balanced colors (common plastics)
        if 100 < brightness < 180 and 20 < saturation < 80:
            if color_variance > 20:
                plastic_score += 30
        scores['plastic'] = plastic_score
        
        # PAPER (beige/tan/brown cardboard, white paper)
        paper_score = 0
        # Brown cardboard (most common)
        if r > g > b and 90 < brightness < 210:
            if (r - b) < 80 and 15 < saturation < 70:
                paper_score += 70
        # White/light paper
        if brightness > 170 and saturation < 40:
            paper_score += 60
        # Tan/beige tones
        if 0.32 < r_ratio < 0.39 and 0.29 < g_ratio < 0.37 and brightness > 100:
            paper_score += 45
        scores['paper'] = paper_score
        
        # GLASS (green/brown/clear bottles)
        glass_score = 0
        # Green glass (beer, wine bottles)
        if g > r and g > b and g_ratio > 0.34:
            if 60 < brightness < 190:
                glass_score += 80
        # Brown glass
        if r > g > b and g_ratio > 0.26 and 40 < brightness < 160:
            if saturation > 15:
                glass_score += 75
        # Clear glass
        if brightness > 150 and saturation < 45 and color_variance < 35:
            glass_score += 50
        # Medium dark with some color
        if 70 < brightness < 140 and saturation > 20:
            glass_score += 35
        scores['glass'] = glass_score
        
        # METAL (gray/silver cans - RELAXED saturation for real photos)
        metal_score = 0
        # Gray metal (cans, foil)
        if 80 < brightness < 200 and saturation < 80:
            if abs(r - g) < 30 and abs(g - b) < 30:  # Relatively uniform
                metal_score += 70
        # Shiny/reflective metal
        if brightness > 130 and saturation < 70 and color_variance < 40:
            metal_score += 55
        # Medium gray tones
        if 100 < brightness < 180 and saturation < 85:
            if abs(r_ratio - g_ratio) < 0.05:  # Balanced RGB
                metal_score += 45
        scores['metal'] = metal_score
        
        # Get the waste type with highest score
        waste_type = max(scores, key=scores.get)
        max_score = scores[waste_type]
        
        # Debug logging - print all scores
        print(f"\n🔍 Image Analysis for: {image_path}")
        print(f"   Brightness: {int(brightness)}, Saturation: {int(saturation)}, Color Variance: {int(color_variance)}")
        print(f"   RGB: ({int(r)}, {int(g)}, {int(b)})")
        print(f"   Scores: {json.dumps(scores, indent=2)}")
        print(f"   Winner: {waste_type} ({max_score} points)\n")
        
        # Convert score to confidence (0-100)
        confidence = min(int(max_score), 95)
        
        # If confidence is too low, default to mixed
        if confidence < 40:
            waste_type = 'Mixed'
            confidence = 60
        
        return {
            'type': waste_type,
            'confidence': confidence,
            'points': self.WASTE_CATEGORIES[waste_type]['points'],
            'description': self.WASTE_CATEGORIES[waste_type]['description'],
            'avg_color': [int(r), int(g), int(b)],
            'analysis': {
                'brightness': int(brightness),
                'saturation': int(saturation),
                'color_variance': int(color_variance)
            }
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
            # ALWAYS use heuristic-based analysis for now
            # The trained model uses synthetic data and doesn't work well with real photos
            # TODO: Train model with real labeled waste images for better accuracy
            result = self.analyze_image_features(image_path)
            
            # Commented out model-based classification until we have real training data
            # if self.model is not None:
            #     result = self.classify_with_model(image_path)
            # else:
            #     result = self.analyze_image_features(image_path)
            
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
