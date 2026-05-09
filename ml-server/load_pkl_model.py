"""
Load disease detection model from .pkl format
Use this to reconstruct the model from pickle file
"""
import tensorflow as tf
from tensorflow import keras
import pickle
import numpy as np
from PIL import Image

def load_model_from_pkl(pkl_path="plant_disease_model.pkl"):
    """
    Load the disease detection model from pickle file
    
    Returns:
        model: Keras model
        class_names: List of class names
    """
    print(f"Loading model from {pkl_path}...")
    
    # Load pickle
    with open(pkl_path, "rb") as f:
        model_package = pickle.load(f)
    
    print(f"✅ Loaded model package")
    print(f"   Version: {model_package.get('version', 'unknown')}")
    print(f"   Classes: {len(model_package['class_names'])}")
    
    # Reconstruct model from config
    model = keras.Model.from_config(model_package['config'])
    
    # Set weights
    model.set_weights(model_package['weights'])
    
    print(f"✅ Model reconstructed successfully!")
    
    return model, model_package['class_names']

def preprocess_image(image_path, img_size=(224, 224)):
    """
    Preprocess image for prediction
    
    Args:
        image_path: Path to image file
        img_size: Target size (width, height)
    
    Returns:
        Preprocessed image array
    """
    # Load image
    img = Image.open(image_path).convert("RGB")
    
    # Resize
    img = img.resize(img_size, Image.Resampling.LANCZOS)
    
    # Convert to array
    img_array = np.array(img, dtype=np.float32)
    
    # MobileNetV2 preprocessing: scale to [-1, 1]
    img_array = img_array / 127.5 - 1.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def predict_disease(model, class_names, image_path):
    """
    Predict disease from image
    
    Args:
        model: Loaded Keras model
        class_names: List of class names
        image_path: Path to image file
    
    Returns:
        dict with prediction results
    """
    # Preprocess image
    img_array = preprocess_image(image_path)
    
    # Predict
    predictions = model.predict(img_array, verbose=0)
    
    # Get top prediction
    predicted_idx = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))
    
    disease_full = class_names[predicted_idx]
    
    # Parse disease name
    if "___" in disease_full:
        crop_name = disease_full.split("___")[0].replace("_", " ")
        disease_name = disease_full.split("___")[1].replace("_", " ")
    else:
        crop_name = "Unknown"
        disease_name = disease_full
    
    # Get top 3 predictions
    top3_idx = np.argsort(predictions[0])[-3:][::-1]
    top3 = [
        {
            "label": class_names[i],
            "confidence": round(float(predictions[0][i]) * 100, 1)
        }
        for i in top3_idx
    ]
    
    return {
        "disease": disease_name,
        "crop": crop_name,
        "confidence": round(confidence * 100, 1),
        "is_healthy": "healthy" in disease_name.lower(),
        "top3": top3
    }

# Example usage
if __name__ == "__main__":
    print("=" * 70)
    print("DISEASE DETECTION MODEL - PKL LOADER")
    print("=" * 70)
    
    # Load model
    model, class_names = load_model_from_pkl("plant_disease_model.pkl")
    
    print(f"\n✅ Model ready for predictions!")
    print(f"   Total classes: {len(class_names)}")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    
    # Example prediction (if you have a test image)
    # result = predict_disease(model, class_names, "test_image.jpg")
    # print(f"\nPrediction: {result}")
    
    print("\n" + "=" * 70)
    print("To use in your code:")
    print("=" * 70)
    print("""
from load_pkl_model import load_model_from_pkl, predict_disease

# Load model once at startup
model, class_names = load_model_from_pkl("plant_disease_model.pkl")

# Use for predictions
result = predict_disease(model, class_names, "image.jpg")
print(result)
    """)
