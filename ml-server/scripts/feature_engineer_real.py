"""
Feature Engineering Script - Real Data Only
Creates lag features, rolling averages, and encodes categorical variables
"""

import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder
import pickle

# Define paths
INPUT_FILE = 'data/final_dataset.csv'
OUTPUT_FILE = 'data/final_features.csv'
ENCODERS_FILE = 'label_encoders.pkl'

def create_lag_features(df, group_cols, target_col, lags):
    """
    Create lag features for a target column within groups
    """
    for lag in lags:
        df[f'lag_{lag}'] = df.groupby(group_cols)[target_col].shift(lag)
    return df

def create_rolling_features(df, group_cols, target_col, windows):
    """
    Create rolling average features for a target column within groups
    """
    for window in windows:
        df[f'rolling_mean_{window}'] = df.groupby(group_cols)[target_col].transform(
            lambda x: x.rolling(window=window, min_periods=1).mean()
        )
    return df

def feature_engineering_real():
    """
    Perform feature engineering on merged real dataset
    """
    print("=" * 60)
    print("STEP 6: FEATURE ENGINEERING (REAL DATA)")
    print("=" * 60)
    
    # Load merged data
    print(f"\n1. Loading merged data from: {INPUT_FILE}")
    try:
        df = pd.read_csv(INPUT_FILE)
        df['date'] = pd.to_datetime(df['date'])
        print(f"   ✓ Loaded {len(df)} records")
        print(f"   ✓ Initial columns: {len(df.columns)}")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {INPUT_FILE}")
        print("   Please run STEP 5 (merge_real_data.py) first!")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Sort data properly for time-series features
    print("\n2. Sorting data for time-series feature creation...")
    df = df.sort_values(['commodity', 'state', 'market', 'date']).reset_index(drop=True)
    print("   ✓ Data sorted by commodity, state, market, and date")
    
    # Create lag features (adjusted for 1-week dataset)
    print("\n3. Creating lag features (lag_1, lag_2, lag_3)...")
    group_cols = ['commodity', 'state', 'market']
    target_col = 'modal_price'
    lags = [1, 2, 3]
    
    df = create_lag_features(df, group_cols, target_col, lags)
    print(f"   ✓ Created {len(lags)} lag features")
    
    # Create rolling average features
    print("\n4. Creating rolling average features (2-day, 3-day)...")
    windows = [2, 3]
    df = create_rolling_features(df, group_cols, target_col, windows)
    print(f"   ✓ Created {len(windows)} rolling average features")
    
    # Display feature statistics
    print("\n5. Feature Statistics:")
    feature_cols = ['lag_1', 'lag_2', 'lag_3', 'rolling_mean_2', 'rolling_mean_3']
    for col in feature_cols:
        non_null = df[col].notna().sum()
        null_count = df[col].isna().sum()
        print(f"   {col}: {non_null} non-null, {null_count} null")
    
    # Encode categorical features
    print("\n6. Encoding categorical features...")
    categorical_cols = ['commodity', 'season', 'state', 'market']
    
    label_encoders = {}
    for col in categorical_cols:
        print(f"   Encoding {col}...")
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col])
        label_encoders[col] = le
        print(f"     ✓ {col}: {len(le.classes_)} unique values")
    
    print(f"   ✓ Encoded {len(categorical_cols)} categorical features")
    
    # Save label encoders for API use
    print("\n7. Saving label encoders...")
    try:
        with open(ENCODERS_FILE, 'wb') as f:
            pickle.dump(label_encoders, f)
        print(f"   ✓ Encoders saved to: {ENCODERS_FILE}")
    except Exception as e:
        print(f"   ⚠ Warning: Could not save encoders: {str(e)}")
    
    # Add additional time-based features
    print("\n8. Adding time-based features...")
    df['day_of_week'] = df['date'].dt.dayofweek
    df['day_of_month'] = df['date'].dt.day
    df['week_of_year'] = df['date'].dt.isocalendar().week
    print("   ✓ Added day_of_week, day_of_month, week_of_year")
    
    # Add derived features
    print("\n9. Adding derived features...")
    df['price_range'] = df['max_price'] - df['min_price']
    df['price_volatility'] = (df['price_range'] / df['modal_price']) * 100
    print("   ✓ Added price_range and price_volatility")
    
    # Display current state
    print(f"\n10. Current dataset shape: {df.shape}")
    print(f"    Total columns: {len(df.columns)}")
    
    # Check for missing values
    print("\n11. Checking for missing values...")
    missing = df.isnull().sum()
    missing_cols = missing[missing > 0]
    
    if len(missing_cols) > 0:
        print("    Missing values found:")
        for col, count in missing_cols.items():
            pct = (count / len(df)) * 100
            print(f"      {col}: {count} ({pct:.2f}%)")
    else:
        print("    ✓ No missing values")
    
    # Drop rows with null values in lag/rolling features
    print("\n12. Dropping rows with null values...")
    initial_rows = len(df)
    df = df.dropna()
    dropped_rows = initial_rows - len(df)
    print(f"    ✓ Dropped {dropped_rows} rows with null values")
    print(f"    ✓ Remaining rows: {len(df)}")
    
    if len(df) == 0:
        print("\n    ✗ ERROR: No data remaining after dropping nulls!")
        print("    This is expected with only 1 week of data.")
        print("    Recommendation: Collect more historical data (at least 1 month)")
        return
    
    # Final dataset info
    print("\n13. Final Dataset Information:")
    print(f"    Total records: {len(df)}")
    print(f"    Total features: {len(df.columns)}")
    print(f"    Date range: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}")
    
    print("\n    All columns:")
    for i, col in enumerate(df.columns, 1):
        print(f"      {i:2d}. {col}")
    
    # Display feature correlation with target
    print("\n14. Feature correlation with modal_price (top 10):")
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    correlations = df[numeric_cols].corr()['modal_price'].abs().sort_values(ascending=False)
    print(correlations.head(10).to_string())
    
    # Save engineered features
    print(f"\n15. Saving engineered features to: {OUTPUT_FILE}")
    try:
        df.to_csv(OUTPUT_FILE, index=False)
        print(f"     ✓ File saved successfully")
        print(f"     ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"     ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print("\n16. Sample of engineered features (first 3 rows):")
    sample_cols = ['date', 'commodity', 'modal_price', 'lag_1', 'lag_2', 
                   'rolling_mean_2', 'temperature', 'rainfall', 'inflation_rate', 'season']
    print(df[sample_cols].head(3).to_string())
    
    print("\n" + "=" * 60)
    print("✓ FEATURE ENGINEERING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"Label encoders: {ENCODERS_FILE}")
    print(f"All features based on: REAL DATA ONLY")
    print(f"Ready for STEP 7: Model Training")
    print("=" * 60)

if __name__ == "__main__":
    feature_engineering_real()
