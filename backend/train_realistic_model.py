"""
Create a realistic waste classification model with synthetic data
This generates images with colors and patterns typical of each waste type
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers  # type: ignore
    import numpy as np
except ImportError as e:
    print(f"❌ Import error: {e}")
    exit(1)

print("\n" + "="*70)
print("  REALISTIC WASTE CLASSIFICATION MODEL TRAINER")
print("="*70 + "\n")

# Waste categories with realistic color patterns
WASTE_TYPES = {
    'plastic': {
        'colors': [(200, 50, 50), (50, 150, 200), (255, 255, 255), (100, 100, 150)],  # Red, blue, white, gray
        'patterns': 'smooth',
        'description': 'Plastic bottles, containers'
    },
    'paper': {
        'colors': [(240, 240, 230), (200, 180, 150), (180, 150, 120)],  # White, beige, brown
        'patterns': 'textured',
        'description': 'Paper, cardboard'
    },
    'glass': {
        'colors': [(200, 255, 200), (100, 200, 100), (50, 150, 50), (150, 100, 50)],  # Green, brown glass
        'patterns': 'shiny',
        'description': 'Glass bottles, jars'
    },
    'metal': {
        'colors': [(192, 192, 192), (169, 169, 169), (128, 128, 128)],  # Silver, gray
        'patterns': 'metallic',
        'description': 'Aluminum cans, metal containers'
    },
    'organic': {
        'colors': [(139, 69, 19), (101, 67, 33), (85, 107, 47), (34, 139, 34)],  # Brown, green
        'patterns': 'irregular',
        'description': 'Food waste, leaves'
    },
    'e-waste': {
        'colors': [(50, 50, 50), (70, 70, 70), (30, 30, 30), (100, 100, 100)],  # Dark gray, black
        'patterns': 'complex',
        'description': 'Electronics, batteries'
    },
    'mixed': {
        'colors': [(150, 150, 150), (120, 120, 120), (180, 180, 180)],  # Mixed grays
        'patterns': 'mixed',
        'description': 'Mixed recyclables'
    },
    'non-recyclable': {
        'colors': [(100, 100, 100), (80, 80, 80), (60, 60, 60)],  # Dark tones
        'patterns': 'varied',
        'description': 'Non-recyclable waste'
    }
}

CATEGORIES = list(WASTE_TYPES.keys())
NUM_CLASSES = len(CATEGORIES)

def generate_realistic_waste_image(waste_type, img_size=(224, 224)):
    """Generate a synthetic image with realistic waste characteristics"""
    img = np.zeros((*img_size, 3), dtype=np.float32)
    
    waste_info = WASTE_TYPES[waste_type]
    colors = waste_info['colors']
    
    # Choose random base color from waste type's typical colors
    base_color = colors[np.random.randint(0, len(colors))]
    
    # Add color variation
    for i in range(3):
        variation = np.random.randint(-30, 30)
        channel_value = np.clip(base_color[i] + variation, 0, 255)
        img[:, :, i] = channel_value
    
    # Add patterns specific to waste type
    if waste_info['patterns'] == 'shiny':  # Glass - add highlights
        center_y, center_x = img_size[0]//2, img_size[1]//2
        y, x = np.ogrid[:img_size[0], :img_size[1]]
        mask = ((y - center_y)**2 + (x - center_x)**2) < (img_size[0]//3)**2
        img[mask] += np.random.randint(30, 50)
        
    elif waste_info['patterns'] == 'textured':  # Paper - add texture
        noise = np.random.randint(-20, 20, img_size)
        for i in range(3):
            img[:, :, i] += noise
            
    elif waste_info['patterns'] == 'metallic':  # Metal - add reflection patterns
        for i in range(0, img_size[0], 20):
            img[i:i+10, :, :] += np.random.randint(10, 30)
    
    # Add random noise
    noise = np.random.normal(0, 5, (*img_size, 3))
    img += noise
    
    # Normalize to 0-1 range
    img = np.clip(img / 255.0, 0, 1)
    
    return img.astype(np.float32)

def create_realistic_dataset(samples_per_class=200):
    """Create realistic synthetic dataset"""
    print(f"📊 Generating realistic dataset ({samples_per_class} samples per class)...")
    
    X = []
    y = []
    
    for idx, category in enumerate(CATEGORIES):
        print(f"   Creating {category} samples... ", end="", flush=True)
        for _ in range(samples_per_class):
            img = generate_realistic_waste_image(category)
            X.append(img)
            y.append(idx)
        print("✓")
    
    X = np.array(X)
    y = keras.utils.to_categorical(y, NUM_CLASSES)
    
    # Shuffle data
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]
    
    # Split train/validation
    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    
    print(f"\n✅ Dataset created:")
    print(f"   - Training: {len(X_train)} samples")
    print(f"   - Validation: {len(X_val)} samples")
    print(f"   - Classes: {NUM_CLASSES}")
    
    return X_train, y_train, X_val, y_val

def create_cnn_model():
    """Create CNN model optimized for waste classification"""
    print("\n🔧 Building CNN model...")
    
    model = keras.Sequential([
        # Input
        layers.Input(shape=(224, 224, 3)),
        
        # First conv block
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Second conv block
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Third conv block
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.BatchNormalization(),
        layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Dense layers
        layers.Flatten(),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        
        # Output
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("✅ Model created!")
    return model

def main():
    # Create dataset
    X_train, y_train, X_val, y_val = create_realistic_dataset(samples_per_class=200)
    
    # Create model
    model = create_cnn_model()
    
    # Show summary
    print("\n📋 Model Summary:")
    model.summary()
    
    # Train
    print("\n🏋️ Training model...")
    print("   This will take 2-3 minutes...\n")
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=20,
        batch_size=32,
        verbose=1
    )
    
    # Evaluate
    print("\n📊 Final Performance:")
    train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
    val_loss, val_acc = model.evaluate(X_val, y_val, verbose=0)
    print(f"   Training Accuracy: {train_acc*100:.2f}%")
    print(f"   Validation Accuracy: {val_acc*100:.2f}%")
    
    # Save
    os.makedirs('models', exist_ok=True)
    save_path = 'models/waste_classifier_model.h5'
    print(f"\n💾 Saving model to {save_path}...")
    model.save(save_path)
    
    file_size = os.path.getsize(save_path) / (1024*1024)
    print(f"✅ Model saved! ({file_size:.2f} MB)")
    
    print("\n" + "="*70)
    print("  ✅ TRAINING COMPLETE!")
    print("="*70)
    print("\n🎯 Model Performance:")
    print(f"   - Validation Accuracy: {val_acc*100:.2f}%")
    print(f"   - Model Size: {file_size:.2f} MB")
    print(f"\n🚀 Next Steps:")
    print(f"   1. Restart Flask backend: python app.py")
    print(f"   2. Model will load automatically from: {save_path}")
    print(f"   3. Upload waste images to test classification!")
    print(f"\n💡 For even better accuracy, train with real labeled waste images.\n")

if __name__ == '__main__':
    main()
