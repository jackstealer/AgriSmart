# Disease Detection Model - Dataset Information

## Dataset Used: PlantVillage Dataset

### Overview
The disease detection model was trained on the **PlantVillage Dataset**, which is one of the most comprehensive and widely-used datasets for plant disease classification.

### Dataset Details

**Source:** PlantVillage Project
**Location:** `plantvillage-dataset/plantvillage dataset/color/`
**Total Classes:** 38 disease categories
**Image Format:** RGB color images
**Image Size:** Resized to 224x224 for training

### Dataset Statistics
- **Total Images:** ~54,000+ images
- **Crops Covered:** 14 different crop species
- **Diseases:** 26 different diseases + healthy classes
- **Image Quality:** High-resolution, controlled environment photos

### Crops Included

1. **Apple** (4 classes)
   - Apple Scab
   - Black Rot
   - Cedar Apple Rust
   - Healthy

2. **Blueberry** (1 class)
   - Healthy

3. **Cherry** (2 classes)
   - Powdery Mildew
   - Healthy

4. **Corn (Maize)** (4 classes)
   - Cercospora Leaf Spot / Gray Leaf Spot
   - Common Rust
   - Northern Leaf Blight
   - Healthy

5. **Grape** (4 classes)
   - Black Rot
   - Esca (Black Measles)
   - Leaf Blight (Isariopsis Leaf Spot)
   - Healthy

6. **Orange** (1 class)
   - Huanglongbing (Citrus Greening)

7. **Peach** (2 classes)
   - Bacterial Spot
   - Healthy

8. **Pepper (Bell)** (2 classes)
   - Bacterial Spot
   - Healthy

9. **Potato** (3 classes)
   - Early Blight
   - Late Blight
   - Healthy

10. **Raspberry** (1 class)
    - Healthy

11. **Soybean** (1 class)
    - Healthy

12. **Squash** (1 class)
    - Powdery Mildew

13. **Strawberry** (2 classes)
    - Leaf Scorch
    - Healthy

14. **Tomato** (10 classes)
    - Bacterial Spot
    - Early Blight
    - Late Blight
    - Leaf Mold
    - Septoria Leaf Spot
    - Spider Mites (Two-spotted Spider Mite)
    - Target Spot
    - Yellow Leaf Curl Virus
    - Tomato Mosaic Virus
    - Healthy

### Model Architecture

**Base Model:** MobileNetV2 (pre-trained on ImageNet)
**Transfer Learning:** Yes
**Fine-tuning:** Top layers trained on PlantVillage
**Input Size:** 224x224x3
**Output:** 38 classes (softmax)

### Training Configuration

```python
- Optimizer: Adam (lr=0.001)
- Loss: Categorical Crossentropy
- Epochs: 15 (with early stopping)
- Batch Size: 32
- Validation Split: 20%
- Data Augmentation: Yes
  - Rotation: ±20°
  - Width/Height Shift: 20%
  - Shear: 20%
  - Zoom: 20%
  - Horizontal Flip: Yes
```

### Model Performance

- **Validation Accuracy:** ~85-95%
- **Model Size:** ~9 MB
- **Inference Time:** <100ms per image
- **Confidence Threshold:** 85%+

### Dataset Preprocessing

1. **Image Normalization:** Scaled to [-1, 1] (MobileNetV2 preprocessing)
2. **Resizing:** All images resized to 224x224
3. **Color Space:** RGB
4. **Data Augmentation:** Applied during training

### Dataset Source & Citation

**Original Dataset:**
- PlantVillage Dataset
- Available on Kaggle: https://www.kaggle.com/datasets/emmarex/plantdisease
- Research Paper: "Using Deep Learning for Image-Based Plant Disease Detection"

**Citation:**
```
Hughes, D. P., & Salathé, M. (2015). 
An open access repository of images on plant health to enable the development of mobile disease diagnostics. 
arXiv preprint arXiv:1511.08060.
```

### Dataset Limitations

1. **Controlled Environment:** Images taken in controlled conditions
2. **Limited Crops:** Only 14 crop types covered
3. **Geographic Bias:** May not represent all regional disease variations
4. **Background:** Clean backgrounds, may differ from field conditions

### Future Improvements

1. Add more crop varieties (wheat, rice, cotton, etc.)
2. Include field condition images
3. Add disease severity levels
4. Multi-disease detection per image
5. Regional disease variations

### Dataset Location

The dataset was used during training but is NOT included in the repository due to size (~2GB).

**To retrain the model:**
1. Download PlantVillage dataset from Kaggle
2. Extract to `ml-server/plantvillage-dataset/`
3. Run training script: `python train_price_model.py`

### Model Files

- **Model:** `plant_disease_model.h5` (9 MB)
- **Classes:** `class_names.txt` (38 classes)
- **Architecture:** MobileNetV2 + Custom Top Layers

---

**Note:** The trained model (`plant_disease_model.h5`) is included in the repository and ready to use. You don't need the dataset unless you want to retrain the model.
