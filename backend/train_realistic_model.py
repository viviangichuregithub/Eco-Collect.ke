"""
Realistic waste classification trainer — patched for GPU memory limits
- Enables memory growth
- Enables mixed precision if available
- Uses tf.data pipeline
- Replaces Flatten() with GlobalAveragePooling2D()
- Uses smaller IMG_SIZE and BATCH_SIZE to avoid OOM
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    # import mixed_precision from keras
    from tensorflow.keras import mixed_precision
    import numpy as np
except ImportError as e:
    print(f"❌ Import error: {e}")
    exit(1)

# User-tweakable runtime settings
IMG_SIZE = (128, 128)   # smaller than 224 to save memory
BATCH_SIZE = 8          # try 8; reduce to 4 or 2 if still OOM
EPOCHS = 20

tf.get_logger().setLevel('INFO')

# GPU setup: memory growth
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print("GPUs found:", gpus)
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("Enabled memory growth for GPUs.")
    except Exception as e:
        print("Warning: could not set memory growth:", e)
else:
    print("No GPUs detected by TensorFlow. If you expected a GPU, check TF install / CUDA.")

# Optional: enable mixed precision for speed on RTX series
try:
    mixed_precision.set_global_policy('mixed_float16')
    MIXED_PRECISION = True
    print("Mixed precision enabled (mixed_float16).")
except Exception:
    MIXED_PRECISION = False

print("\n" + "="*70)
print("  REALISTIC WASTE CLASSIFICATION MODEL TRAINER")
print("="*70 + "\n")

# Waste categories with realistic color patterns
WASTE_TYPES = {
    'plastic': {
        'colors': [(200, 50, 50), (50, 150, 200), (255, 255, 255), (100, 100, 150)],
        'patterns': 'smooth',
        'description': 'Plastic bottles, containers'
    },
    'paper': {
        'colors': [(240, 240, 230), (200, 180, 150), (180, 150, 120)],
        'patterns': 'textured',
        'description': 'Paper, cardboard'
    },
    'glass': {
        'colors': [(200, 255, 200), (100, 200, 100), (50, 150, 50), (150, 100, 50)],
        'patterns': 'shiny',
        'description': 'Glass bottles, jars'
    },
    'metal': {
        'colors': [(192, 192, 192), (169, 169, 169), (128, 128, 128)],
        'patterns': 'metallic',
        'description': 'Aluminum cans, metal containers'
    },
    'organic': {
        'colors': [(139, 69, 19), (101, 67, 33), (85, 107, 47), (34, 139, 34)],
        'patterns': 'irregular',
        'description': 'Food waste, leaves'
    },
    'e-waste': {
        'colors': [(50, 50, 50), (70, 70, 70), (30, 30, 30), (100, 100, 100)],
        'patterns': 'complex',
        'description': 'Electronics, batteries'
    },
    'mixed': {
        'colors': [(150, 150, 150), (120, 120, 120), (180, 180, 180)],
        'patterns': 'mixed',
        'description': 'Mixed recyclables'
    },
    'non-recyclable': {
        'colors': [(100, 100, 100), (80, 80, 80), (60, 60, 60)],
        'patterns': 'varied',
        'description': 'Non-recyclable waste'
    }
}

CATEGORIES = list(WASTE_TYPES.keys())
NUM_CLASSES = len(CATEGORIES)

def generate_realistic_waste_image(waste_type, img_size=IMG_SIZE):
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

def create_realistic_dataset(samples_per_class=200, img_size=IMG_SIZE):
    """Create realistic synthetic dataset"""
    print(f"📊 Generating realistic dataset ({samples_per_class} samples per class) with image size {img_size} ...")
    X = []
    y = []
    for idx, category in enumerate(CATEGORIES):
        print(f"   Creating {category} samples... ", end="", flush=True)
        for _ in range(samples_per_class):
            img = generate_realistic_waste_image(category, img_size=img_size)
            X.append(img)
            y.append(idx)
        print("✓")
    X = np.array(X, dtype=np.float32)
    y = keras.utils.to_categorical(y, NUM_CLASSES)
    indices = np.random.permutation(len(X))
    X = X[indices]; y = y[indices]
    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]
    print(f"\n✅ Dataset created:")
    print(f"   - Training: {len(X_train)} samples")
    print(f"   - Validation: {len(X_val)} samples")
    print(f"   - Classes: {NUM_CLASSES}")
    return X_train, y_train, X_val, y_val

def create_cnn_model(img_size=IMG_SIZE):
    """Create CNN model optimized for waste classification (memory-friendly)"""
    print("\n🔧 Building CNN model...")
    inputs = layers.Input(shape=(*img_size, 3))

    # First conv block
    x = layers.Conv2D(32, (3,3), activation='relu', padding='same')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(32, (3,3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2,2))(x)
    x = layers.Dropout(0.20)(x)

    # Second conv block
    x = layers.Conv2D(64, (3,3), activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(64, (3,3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2,2))(x)
    x = layers.Dropout(0.20)(x)

    # Third conv block
    x = layers.Conv2D(128, (3,3), activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(128, (3,3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2,2))(x)
    x = layers.Dropout(0.20)(x)

    # Replace heavy Flatten with GlobalAveragePooling2D
    x = layers.GlobalAveragePooling2D()(x)

    # Smaller dense heads to reduce memory
    x = layers.Dense(128, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)

    # Final output: if mixed precision is on, ensure dtype float32 for stability
    if MIXED_PRECISION:
        outputs = layers.Dense(NUM_CLASSES, activation='softmax', dtype='float32')(x)
    else:
        outputs = layers.Dense(NUM_CLASSES, activation='softmax')(x)

    model = keras.Model(inputs, outputs)
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    print("✅ Model created!")
    return model

def make_tf_dataset(X, y, batch_size=BATCH_SIZE, shuffle=True):
    # expects X float32 in [0,1] and one-hot y
    dataset = tf.data.Dataset.from_tensor_slices((X.astype('float32'), y.astype('float32')))
    if shuffle:
        dataset = dataset.shuffle(buffer_size=1024)
    dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return dataset

def main():
    # Create dataset (uses IMG_SIZE)
    X_train, y_train, X_val, y_val = create_realistic_dataset(samples_per_class=200, img_size=IMG_SIZE)

    # Create tf.data datasets
    train_ds = make_tf_dataset(X_train, y_train, batch_size=BATCH_SIZE, shuffle=True)
    val_ds = make_tf_dataset(X_val, y_val, batch_size=BATCH_SIZE, shuffle=False)

    # Build model
    model = create_cnn_model(img_size=IMG_SIZE)

    # Show summary
    print("\n📋 Model Summary:")
    model.summary()

    # Train
    print("\n🏋️ Training model...")
    print(f"   Using IMG_SIZE={IMG_SIZE}, BATCH_SIZE={BATCH_SIZE}, EPOCHS={EPOCHS}\n")

    device = '/GPU:0' if tf.config.list_physical_devices('GPU') else '/CPU:0'
    with tf.device(device):
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=EPOCHS,
            verbose=1
        )

    # Evaluate
    print("\n📊 Final Performance:")
    train_loss, train_acc = model.evaluate(train_ds, verbose=0)
    val_loss, val_acc = model.evaluate(val_ds, verbose=0)
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
    print("\n💡 For even better accuracy, train with real labeled waste images.\n")

if __name__ == '__main__':
    main()
