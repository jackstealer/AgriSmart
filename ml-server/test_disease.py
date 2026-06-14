"""
Quick test: send a small test image to ML server /predict-binary
and see what Groq Vision returns.
"""
import sys, io, os, base64, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import requests
from PIL import Image, ImageDraw

# Create a simple green leaf-like test image
print("[*] Creating test plant image...")
img = Image.new('RGB', (224, 224), color=(34, 139, 34))
draw = ImageDraw.Draw(img)
# Add some brown spots (simulated disease)
draw.ellipse([80, 80, 120, 120], fill=(139, 69, 19))
draw.ellipse([140, 60, 165, 85],  fill=(165, 42, 42))
draw.ellipse([50, 130, 75, 155],  fill=(101, 67, 33))

buf = io.BytesIO()
img.save(buf, format='JPEG', quality=85)
image_bytes = buf.getvalue()
print(f"[*] Test image: {len(image_bytes)} bytes (JPEG, 224x224 with brown spots)")

# Test directly against ML server
ML_URL = "http://localhost:5001"
print(f"\n[*] Testing POST {ML_URL}/predict-binary  (crop: wheat)...")
try:
    resp = requests.post(
        f"{ML_URL}/predict-binary",
        data=image_bytes,
        headers={
            "Content-Type": "image/jpeg",
            "X-Crop-Type": "wheat"
        },
        timeout=60
    )
    print(f"    Status: {resp.status_code}")
    data = resp.json()
    print(f"    Response:\n{json.dumps(data, indent=2)}")
except Exception as e:
    print(f"    ERROR: {e}")

print("\n[*] Also testing /health...")
try:
    resp = requests.get(f"{ML_URL}/health", timeout=5)
    print(f"    Health: {resp.json()}")
except Exception as e:
    print(f"    Health error: {e}")
