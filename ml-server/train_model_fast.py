"""
Fast price model trainer — uses only scikit-learn (no xgboost needed).
Run from the ml-server directory: python train_model_fast.py
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

print("🌾 AgriSmart — Fast Crop Price Model Trainer")
print("=" * 50)

# Save models relative to this script (ml-server/models/)
os.makedirs('models', exist_ok=True)

# ── Real MSP/base prices (₹/quintal) ──────────────────────────────────────────
base_prices = {
    'Wheat': 2275, 'Rice': 2183, 'Maize': 2225, 'Potato': 800,
    'Tomato': 1200, 'Onion': 1500, 'Soybean': 4600, 'Cotton': 6620,
    'Sugarcane': 315, 'Chilli': 8000, 'Gram': 5440, 'Mustard': 5650
}

crops  = list(base_prices.keys())
states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka',
          'Andhra Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat',
          'Bihar', 'West Bengal', 'Tamil Nadu']

crop_seasons = {
    'Wheat': 'Rabi',    'Rice': 'Kharif',       'Maize': 'Kharif',
    'Potato': 'Rabi',   'Tomato': 'Year-round',  'Onion': 'Rabi',
    'Soybean': 'Kharif','Cotton': 'Kharif',      'Sugarcane': 'Year-round',
    'Chilli': 'Kharif', 'Gram': 'Rabi',          'Mustard': 'Rabi'
}

seasonal_factors = {
    1: 1.02, 2: 1.05, 3: 1.08, 4: 1.05, 5: 0.95, 6: 0.88,
    7: 0.85, 8: 0.90, 9: 0.95, 10: 0.98, 11: 1.00, 12: 1.03
}

# ── Generate synthetic dataset ──────────────────────────────────────────────
print("\n📊 Generating synthetic AGMARK dataset...")
np.random.seed(42)
rows = []

for year in range(2018, 2026):
    inflation_factor = 1 + (year - 2018) * 0.055
    for month in range(1, 13):
        seasonal = seasonal_factors[month]
        for crop in crops:
            base = base_prices[crop]
            # Weather simulation
            if month in [6, 7, 8, 9]:
                rainfall = np.random.normal(200, 60)
            else:
                rainfall = np.random.normal(100, 40)
            if month in [5, 6]:
                temp = np.random.normal(38, 3)
            elif month in [12, 1]:
                temp = np.random.normal(15, 4)
            else:
                temp = np.random.normal(28, 5)
            weather_impact = 1.0
            if rainfall < 50:   weather_impact = 1.15
            elif rainfall > 300: weather_impact = 1.10
            elif temp > 42:      weather_impact = 1.08
            demand_index = np.random.uniform(0.85, 1.15)
            noise = np.random.normal(1, 0.04)
            price = base * inflation_factor * seasonal * weather_impact * demand_index * noise
            for state in states:
                state_factor = np.random.uniform(0.92, 1.08)
                state_price = price * state_factor
                rows.append({
                    'year': year, 'month': month,
                    'crop': crop, 'state': state,
                    'season': crop_seasons[crop],
                    'rainfall_mm': round(max(0, rainfall + np.random.normal(0, 20)), 1),
                    'temperature_c': round(temp + np.random.normal(0, 2), 1),
                    'demand_index': round(demand_index * np.random.uniform(0.95, 1.05), 3),
                    'inflation_rate': round((inflation_factor - 1) * 100, 2),
                    'price_per_quintal': round(max(base * 0.5, state_price), 2)
                })

df = pd.DataFrame(rows)
print(f"✅ Generated {len(df):,} records ({len(crops)} crops × {len(states)} states × 8 years)")

# ── Feature engineering ────────────────────────────────────────────────────
df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
df['supply_demand_ratio'] = 1 / df['demand_index']
df['weather_risk'] = (
    (df['rainfall_mm'] < 50).astype(int) * 2 +
    (df['rainfall_mm'] > 300).astype(int) * 1.5 +
    (df['temperature_c'] > 40).astype(int) * 1.5
)

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

X = df[feature_cols].values
y = df['price_per_quintal'].values
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"\n🔧 Train: {len(X_train):,} | Test: {len(X_test):,}")

# ── Train Random Forest (main model) ────────────────────────────────────────
print("\n🤖 Training Random Forest...")
rf = RandomForestRegressor(
    n_estimators=200, max_depth=15, min_samples_split=4,
    random_state=42, n_jobs=-1
)
rf.fit(X_train, y_train)
pred = rf.predict(X_test)
r2  = r2_score(y_test, pred)
mae = mean_absolute_error(y_test, pred)
print(f"   R²: {r2:.4f}  |  MAE: ₹{mae:.0f}/quintal")

# ── Train Gradient Boosting (secondary) ─────────────────────────────────────
print("🤖 Training Gradient Boosting...")
gb = GradientBoostingRegressor(
    n_estimators=200, max_depth=6, learning_rate=0.08,
    subsample=0.85, random_state=42
)
gb.fit(X_train, y_train)
pred_gb = gb.predict(X_test)
r2_gb  = r2_score(y_test, pred_gb)
mae_gb = mean_absolute_error(y_test, pred_gb)
print(f"   R²: {r2_gb:.4f}  |  MAE: ₹{mae_gb:.0f}/quintal")

# Use best model as primary
best_model = rf if r2 >= r2_gb else gb
print(f"\n🏆 Using {'Random Forest' if r2 >= r2_gb else 'Gradient Boosting'} as primary model")

# ── Save ──────────────────────────────────────────────────────────────────────
print("\n💾 Saving models to models/...")
joblib.dump(best_model,    'models/price_model.pkl')
joblib.dump(label_encoders,'models/encoders.pkl')
joblib.dump(feature_cols,  'models/features.pkl')
print("   ✓ models/price_model.pkl")
print("   ✓ models/encoders.pkl")
print("   ✓ models/features.pkl")
print("\n✅ Done! Restart the ML server: python app.py")
