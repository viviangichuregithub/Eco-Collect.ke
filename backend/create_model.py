"""
Script to create a pre-trained waste classification model using transfer learning
This uses MobileNetV2 as a base and can be fine-tuned with your own dataset
"""
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers  # type: ignore
    import numpy as np
    import os
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install required packages: pip install tensorflow numpy")
    exit(1)

# Waste categories (must match ai_classifier.py)
WASTE_CATEGORIES = ['plastic', 'paper', 'glass', 'metal', 'organic', 'e-waste', 'mixed', 'non-recyclable']
NUM_CLASSES = len(WASTE_CATEGORIES)

def create_waste_classifier_model(img_size=(224, 224)):
    """
    Create a waste classification model using MobileNetV2 transfer learning
    
    Args:
        img_size: Input image size (height, width)
        
    Returns:
        Compiled Keras model
    """
    print("🔧 Creating waste classification model...")
    
    # Load pre-trained MobileNetV2 (without top classification layer)
    base_model = keras.applications.MobileNetV2(
        input_shape=(*img_size, 3),
        include_top=False,
        weights='imagenet'  # Use ImageNet pre-trained weights
    )
    
    # Freeze the base model (don't train ImageNet weights)
    base_model.trainable = False
    
    # Create the model
    inputs = keras.Input(shape=(*img_size, 3))
    
    # Preprocessing for MobileNetV2
    x = keras.applications.mobilenet_v2.preprocess_input(inputs)
    
    # Base model
    x = base_model(x, training=False)
    
    # Add custom classification head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("✅ Model created successfully!")
    print(f"   - Base: MobileNetV2 (ImageNet)")
    print(f"   - Classes: {NUM_CLASSES}")
    print(f"   - Input size: {img_size}")
    
    return model

def create_demo_training_data(num_samples=100):
    """
    Create dummy training data for demonstration
    In production, replace this with real labeled waste images
    
    Args:
        num_samples: Number of samples per class
        
    Returns:
        X_train, y_train, X_val, y_val
    """
    print(f"📊 Generating demo training data ({num_samples} samples per class)...")
    
    img_size = (224, 224, 3)
    total_samples = num_samples * NUM_CLASSES
    
    # Generate random images (in production, load real images)
    X = np.random.rand(total_samples, *img_size).astype('float32')
    
    # Generate labels
    y = np.repeat(range(NUM_CLASSES), num_samples)
    y = keras.utils.to_categorical(y, NUM_CLASSES)
    
    # Split into train/validation
    split_idx = int(0.8 * total_samples)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    print(f"   - Training samples: {len(X_train)}")
    print(f"   - Validation samples: {len(X_val)}")
    
    return X_train, y_train, X_val, y_val

def train_model(model, X_train, y_train, X_val, y_val, epochs=10):
    """
    Train the model (demo version with random data)
    
    Args:
        model: Keras model
        X_train, y_train: Training data
        X_val, y_val: Validation data
        epochs: Number of training epochs
    """
    print(f"\n🏋️ Training model for {epochs} epochs...")
    print("   (Using demo data - in production, use real labeled images)")
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=32,
        verbose=1
    )
    
    return history

def save_model(model, save_path='waste_classifier_model.h5'):
    """
    Save the trained model
    
    Args:
        model: Trained Keras model
        save_path: Path to save the model
    """
    print(f"\n💾 Saving model to {save_path}...")
    model.save(save_path)
    print(f"✅ Model saved successfully!")
    print(f"   File size: {os.path.getsize(save_path) / (1024*1024):.2f} MB")

def main():
    """
    Main function to create and train the waste classification model
    """
    print("=" * 60)
    print("   WASTE CLASSIFICATION MODEL CREATOR")
    print("=" * 60)
    print("\n⚠️  NOTE: This demo uses random data.")
    print("   For production, replace with real labeled waste images.\n")
    
    # Create model
    model = create_waste_classifier_model()
    
    # Show model summary
    print("\n📋 Model Architecture:")
    model.summary()
    
    # Create demo training data
    # TODO: Replace with real waste image dataset
    X_train, y_train, X_val, y_val = create_demo_training_data(num_samples=100)
    
    # Train model
    history = train_model(model, X_train, y_train, X_val, y_val, epochs=5)
    
    # Save model
    save_path = 'backend/models/waste_classifier_model.h5'
    os.makedirs('backend/models', exist_ok=True)
    save_model(model, save_path)
    
    print("\n" + "=" * 60)
    print("✅ SETUP COMPLETE!")
    print("=" * 60)
    print(f"\n📦 Model saved to: {save_path}")
    print("\n📝 Next steps:")
    print("   1. Update ai_classifier.py to load this model")
    print("   2. Collect real waste images for better accuracy")
    print("   3. Fine-tune model with your dataset")
    print("\n🚀 Start backend server: python app.py")
    print("   The AI will now use the trained model instead of fallback!\n")

if __name__ == '__main__':
    main()
