"""
Convert disease detection model from .h5 to .pkl format
This makes it easier to share and load
"""
import tensorflow as tf
import pickle
import os

print("=" * 70)
print("CONVERTING DISEASE DETECTION MODEL TO PKL FORMAT")
print("=" * 70)

# Load the .h5 model
print("\n1. Loading .h5 model...")
try:
    model = tf.keras.models.load_model("plant_disease_model.h5")
    print("✅ Model loaded successfully!")
    print(f"   Model type: {type(model)}")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    exit(1)

# Load class names
print("\n2. Loading class names...")
try:
    with open("class_names.txt", "r") as f:
        class_names = [line.strip() for line in f.readlines()]
    print(f"✅ Loaded {len(class_names)} class names")
except Exception as e:
    print(f"❌ Error loading class names: {e}")
    exit(1)

# Get model weights
print("\n3. Extracting model weights...")
try:
    weights = model.get_weights()
    print(f"✅ Extracted {len(weights)} weight arrays")
except Exception as e:
    print(f"❌ Error extracting weights: {e}")
    exit(1)

# Get model config
print("\n4. Extracting model configuration...")
try:
    config = model.get_config()
    print(f"✅ Extracted model configuration")
except Exception as e:
    print(f"❌ Error extracting config: {e}")
    exit(1)

# Create a dictionary with all model data
print("\n5. Creating model package...")
model_package = {
    'weights': weights,
    'config': config,
    'class_names': class_names,
    'input_shape': model.input_shape,
    'output_shape': model.output_shape,
    'model_type': 'MobileNetV2',
    'preprocessing': 'mobilenet_v2',  # Scale to [-1, 1]
    'image_size': (224, 224),
    'version': '1.0'
}

# Save as pickle
print("\n6. Saving as .pkl file...")
try:
    with open("plant_disease_model.pkl", "wb") as f:
        pickle.dump(model_package, f, protocol=pickle.HIGHEST_PROTOCOL)
    
    file_size = os.path.getsize("plant_disease_model.pkl") / (1024 * 1024)
    print(f"✅ Model saved as plant_disease_model.pkl")
    print(f"   File size: {file_size:.2f} MB")
except Exception as e:
    print(f"❌ Error saving pickle: {e}")
    exit(1)

# Test loading the pickle
print("\n7. Testing pickle file...")
try:
    with open("plant_disease_model.pkl", "rb") as f:
        loaded_package = pickle.load(f)
    
    print("✅ Pickle file loads successfully!")
    print(f"   Classes: {len(loaded_package['class_names'])}")
    print(f"   Weights: {len(loaded_package['weights'])} arrays")
    print(f"   Input shape: {loaded_package['input_shape']}")
except Exception as e:
    print(f"❌ Error loading pickle: {e}")
    exit(1)

print("\n" + "=" * 70)
print("✅ CONVERSION COMPLETE!")
print("=" * 70)
print("\nYou can now share: plant_disease_model.pkl")
print(f"File size: {file_size:.2f} MB")
print("\nTo use this model, see: load_pkl_model.py")
