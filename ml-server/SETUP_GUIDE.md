# ML Server Setup Guide

## Quick Setup for Teammates

### Step 1: Pull Latest Code

```bash
git checkout ml-features
git pull origin ml-features
```

### Step 2: Install Python Dependencies

```bash
cd ml-server
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install manually:

```bash
pip install flask flask-cors tensorflow pillow python-dotenv groq-sdk google-generativeai requests pandas scikit-learn joblib numpy
```

### Step 3: Verify Model Files Exist

Check these files are present:

```bash
ls ml-server/
```

You should see:
- ✅ `plant_disease_model.h5` (~9 MB) - Disease detection model
- ✅ `class_names.txt` - Disease class names
- ✅ `models/price_model.pkl` - Price prediction model
- ✅ `models/encoders.pkl` - Label encoders
- ✅ `models/features.pkl` - Feature columns
- ✅ `app.py` - ML server

### Step 4: Set Up Environment Variables

Create `.env` file in `ml-server/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

### Step 5: Run ML Server

```bash
cd ml-server
python app.py
```

You should see:
```
Loading disease detection model...
[OK] Disease detection model loaded successfully!
Loading price prediction model...
[OK] Price prediction model loaded successfully!
ML server running on port 5001
```

### Step 6: Test the Server

Open another terminal and test:

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "ok",
  "disease_model_loaded": true,
  "price_model_loaded": true
}
```

---

## Troubleshooting

### Error: "No disease detection model found"

**Solution:**
```bash
# Make sure you're on ml-features branch
git checkout ml-features

# Pull latest with model files
git pull origin ml-features

# Verify file exists
ls -lh ml-server/plant_disease_model.h5
```

### Error: "ModuleNotFoundError: No module named 'tensorflow'"

**Solution:**
```bash
pip install tensorflow
# Or for CPU-only version (smaller):
pip install tensorflow-cpu
```

### Error: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
pip install flask flask-cors
```

### Error: Port 5001 already in use

**Solution:**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5001 | xargs kill -9
```

### Model file is corrupted or won't load

**Solution:**
```bash
# Re-download from repository
git checkout ml-features -- ml-server/plant_disease_model.h5

# Or ask teammate to share via Google Drive/Dropbox
```

---

## File Sizes

- `plant_disease_model.h5`: ~9 MB
- `models/price_model.pkl`: ~1 MB
- `models/encoders.pkl`: ~10 KB
- `models/features.pkl`: ~1 KB

Total: ~10 MB

---

## Alternative: Download Models Separately

If Git is having issues with large files, download models from:

1. **Google Drive Link:** [Share the link]
2. **Dropbox Link:** [Share the link]

Then place files in:
```
ml-server/
  ├── plant_disease_model.h5
  ├── class_names.txt
  └── models/
      ├── price_model.pkl
      ├── encoders.pkl
      └── features.pkl
```

---

## Python Version

Recommended: Python 3.9 or 3.10

Check your version:
```bash
python --version
```

---

## Complete Dependency List

```
flask==3.0.0
flask-cors==4.0.0
tensorflow==2.15.0  # or tensorflow-cpu
pillow==10.1.0
python-dotenv==1.0.0
groq==0.4.0
google-generativeai==0.3.0
requests==2.31.0
pandas==2.1.0
scikit-learn==1.3.0
joblib==1.3.0
numpy==1.24.0
```

Save as `requirements.txt` and run:
```bash
pip install -r requirements.txt
```

---

## Need Help?

1. Check if all files are present: `ls ml-server/`
2. Check Python version: `python --version`
3. Check installed packages: `pip list`
4. Check server logs when running `python app.py`

If still having issues, share the error message!
