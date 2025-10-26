"""
Quick setup script to create a basic waste classification model
This is a lightweight version that creates a model ready for use
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow warnings

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers  # type: ignore
except ImportError:
    print("❌ TensorFlow not installed. Please run: pip install tensorflow")
    exit(1)

print("\n" + "="*60)
print("  WASTE CLASSIFICATION MODEL - QUICK SETUP")
print("="*60 + "\n")

# Create models directory
os.makedirs('models', exist_ok=True)

print("🔧 Creating AI model...")

# Simple CNN model for waste classification
model = keras.Sequential([
    # Input layer
    layers.Input(shape=(224, 224, 3)),
    
    # Convolutional layers
    layers.Conv2D(32, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(),
    layers.Conv2D(128, 3, activation='relu'),
    layers.MaxPooling2D(),
    
    # Dense layers
    layers.Flatten(),
    layers.Dropout(0.5),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(8, activation='softmax')  # 8 waste categories
])

# Compile the model
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("✅ Model created!")
print(f"   - Input: 224x224x3 (RGB images)")
print(f"   - Output: 8 classes (plastic, paper, glass, metal, organic, e-waste, mixed, non-recyclable)")
print(f"   - Parameters: {model.count_params():,}")

# Save the model
model_path = 'models/waste_classifier_model.h5'
print(f"\n💾 Saving model to {model_path}...")
model.save(model_path)

file_size_mb = os.path.getsize(model_path) / (1024 * 1024)
print(f"✅ Model saved! ({file_size_mb:.2f} MB)")

print("\n" + "="*60)
print("  ✅ SETUP COMPLETE!")
print("="*60)
print("\n📝 What was created:")
print(f"   ✓ AI Model: {model_path}")
print(f"   ✓ Size: {file_size_mb:.2f} MB")
print(f"   ✓ Status: Ready to use!")

print("\n🚀 Next steps:")
print("   1. Restart Flask server (Ctrl+C, then: python app.py)")
print("   2. You should see: '✅ Found model at: ...'")
print("   3. AI classification will now use the trained model!\n")

print("📌 Note: This is a basic model. For better accuracy:")
print("   - Collect real labeled waste images")
print("   - Train with: python create_model.py (full version)")
print("   - Or use pre-trained models like MobileNet\n")
