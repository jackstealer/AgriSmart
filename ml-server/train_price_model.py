import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

print("🌾 Crop Price Prediction Model Trainer")
print("=" * 50)

# Create directories
os.makedirs('price-data', exist_ok=True)
os.makedirs('ml-server/models', exist_ok=True)

# Generate synthetic dataset based on real AGMARK patterns
print("\n📊 Generating synthetic AGMARK dataset...")

crops = ['Wheat', 'Rice', 'Maize', 'Potato', 'Tomato', 'Onion', 
         'Soybean', 'Cotton', 'Sugarcane', 'Chilli', 'Gram', 'Mustard']

states = ['Punjab', 'Haryana', 'UP', 'Maharashtra', 'Karnataka', 
         'Andhra Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 
         'Bihar', 'West Bengal', 'Tamil Nadu']

# Real MSP/base prices (₹/quintal)
base_prices = {
    'Wheat': 2275, 'Rice': 2183, 'Maize': 2225, 'Potato': 800,
    'Tomato': 1200, 'Onion': 1500, 'Soybean': 4600, 'Cotton': 6620,
    'Sugarcane': 315, 'Chilli': 8000, 'Gram': 5440, 'Mustard': 5650
}

seasonal_factors = {
    1: 1.02, 2: 1.05, 3: 1.08, 4: 1.05, 5: 0.95, 6: 0.88,
    7: 0.85, 8: 0.90, 9: 0.95, 10: 0.98, 11: 1.00, 12: 1.03
}

crop_seasons = {
    'Wheat': 'Rabi', 'Rice': 'Kharif', 'Maize': 'Kharif',
    'Potato': 'Rabi', 'Tomato': 'Year-round', 'Onion': 'Rabi',
    'Soybean': 'Kharif', 'Cotton': 'Kharif', 'Sugarcane': 'Year-round',
    'Chilli': 'Kharif', 'Gram': 'Rabi', 'Mustard': 'Rabi'
}

rows = []
np.random.seed(42)

for year in range(2019, 2025):
    inflation_factor = 1 + (year - 2019) * 0.055
    
    for month in range(1, 13):
        seasonal = seasonal_factors[month]
        
        for crop in crops:
            base = base_prices[crop]
            season = crop_seasons[crop]
            
            # Weather simulation
            rainfall = np.random.normal(120, 40)
            if month in [6, 7, 8, 9]:
                rainfall = np.random.normal(200, 60)
            
            temp = np.random.normal(28, 5)
            if month in [5, 6]:
                temp = np.random.normal(38, 3)
            elif month in [12, 1]:
                temp = np.random.normal(15, 4)
            
            # Weather impact
            weather_impact = 1.0
            if rainfall < 50:
                weather_impact = 1.15
            elif rainfall > 300:
                weather_impact = 1.10
            elif temp > 42:
                weather_impact = 1.08
            
            demand_index = np.random.uniform(0.85, 1.15)
            noise = np.random.normal(1, 0.04)
            price = base * inflation_factor * seasonal * weather_impact * demand_index * noise
            
            for state in states:
                state_factor = np.random.uniform(0.92, 1.08)
                state_price = price * state_factor
                
                rows.append({
                    'year': year,
                    'month': month,
                    'crop': crop,
                    'state': state,
                    'season': season,
                    'rainfall_mm': round(max(0, rainfall + np.random.normal(0, 20)), 1),
                    'temperature_c': round(temp + np.random.normal(0, 2), 1),
                    'demand_index': round(demand_index * np.random.uniform(0.95, 1.05), 3),
                    'inflation_rate': round((inflation_factor - 1) * 100, 2),
                    'price_per_quintal': round(max(base * 0.5, state_price), 2)
                })

df = pd.DataFrame(rows)
df.to_csv('price-data/agmark_prices.csv', index=False)
print(f"✅ Generated {len(df):,} records")

# Preprocessing
print("\n🔧 Preprocessing data...")
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['supply_demand_ratio'] = 1 / df['demand_index']
df['weather_risk'] = (
    (df['rainfall_mm'] < 50).astype(int) * 2 +
    (df['rainfall_mm'] > 300).astype(int) * 1.5 +
    (df['temperature_c'] > 40).astype(int) * 1.5
)

# Encode categoricals
label_encoders = {}
for col in ['crop', 'state', 'season']:
    le = LabelEncoder()
    df[f'{col}_encoded'] = le.fit_transform(df[col])
    label_encoders[col] = le

feature_cols = [
    'year', 'month', 'month_sin', 'month_cos',
    'crop_encoded', 'state_encoded', 'season_encoded',
    'rainfall_mm', 'temperature_c', 'demand_index',
    'inflation_rate', 'supply_demand_ratio', 'weather_risk'
]

X = df[feature_cols]
y = df['price_per_quintal']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"   Training samples: {len(X_train):,}")
print(f"   Test samples: {len(X_test):,}")

# Train models
print("\n🤖 Training ML models...")

# XGBoost
print("   Training XGBoost...")
xgb_model = xgb.XGBRegressor(
    n_estimators=200, max_depth=8, learning_rate=0.1,
    subsample=0.8, colsample_bytree=0.8, random_state=42
)
xgb_model.fit(X_train, y_train)

# Random Forest
print("   Training Random Forest...")
rf_model = RandomForestRegressor(
    n_estimators=150, max_depth=15, min_samples_split=5,
    random_state=42, n_jobs=-1
)
rf_model.fit(X_train, y_train)

# Gradient Boosting
print("   Training Gradient Boosting...")
gb_model = GradientBoostingRegressor(
    n_estimators=150, max_depth=5, learning_rate=0.1, random_state=42
)
gb_model.fit(X_train, y_train)

# Evaluate
print("\n📈 Model Performance:")
print("-" * 60)
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

models = {'XGBoost': xgb_model, 'Random Forest': rf_model, 'Gradient Boosting': gb_model}
for name, model in models.items():
    pred = model.predict(X_test)
    r2 = r2_score(y_test, pred)
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    mae = mean_absolute_error(y_test, pred)
    print(f"   {name:18} | R²: {r2:.4f} | RMSE: {rmse:8.2f} | MAE: {mae:8.2f}")

# Save models
print("\n💾 Saving models...")
joblib.dump(xgb_model, 'ml-server/models/price_model.pkl')
joblib.dump(label_encoders, 'ml-server/models/encoders.pkl')
joblib.dump(feature_cols, 'ml-server/models/features.pkl')
joblib.dump(models, 'ml-server/models/ensemble_models.pkl')

print("   ✓ price_model.pkl")
print("   ✓ encoders.pkl")
print("   ✓ features.pkl")
print("   ✓ ensemble_models.pkl")

print("\n" + "=" * 50)
print("✅ Training complete! Start the ML server with: python ml-server/app.py")
print("=" * 50)