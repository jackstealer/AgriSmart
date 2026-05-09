"""
Data Cleaning Script for Agricultural Price Prediction
Cleans and filters the raw price data for model training
"""

import pandas as pd
import os
from datetime import datetime

# Define paths
INPUT_FILE = 'price-data/Price_Agriculture_commodities_Week.csv'
OUTPUT_DIR = 'data'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'price_clean.csv')

# Target crops to filter
TARGET_CROPS = ['Potato', 'Onion', 'Wheat', 'Rice', 'Maize', 'Tomato']

def clean_price_data():
    """
    Load, clean, and filter agricultural price data
    """
    print("=" * 60)
    print("STEP 1: DATA CLEANING")
    print("=" * 60)
    
    # Create output directory if it doesn't exist
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"✓ Created directory: {OUTPUT_DIR}")
    
    # Load the dataset
    print(f"\n1. Loading data from: {INPUT_FILE}")
    try:
        df = pd.read_csv(INPUT_FILE)
        print(f"   ✓ Loaded {len(df)} rows")
        print(f"   ✓ Columns: {list(df.columns)}")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {INPUT_FILE}")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Display initial data info
    print(f"\n2. Initial dataset shape: {df.shape}")
    print(f"   Unique commodities: {df['Commodity'].nunique()}")
    
    # Extract required columns
    print("\n3. Extracting required columns...")
    required_columns = ['Arrival_Date', 'Commodity', 'Modal Price', 
                       'Min Price', 'Max Price', 'State', 'Market']
    
    df_clean = df[required_columns].copy()
    print(f"   ✓ Extracted {len(required_columns)} columns")
    
    # Rename columns for consistency
    print("\n4. Renaming columns...")
    df_clean.columns = ['date', 'commodity', 'modal_price', 
                        'min_price', 'max_price', 'state', 'market']
    print("   ✓ Columns renamed")
    
    # Convert date format (DD-MM-YYYY to YYYY-MM-DD)
    print("\n5. Converting date format...")
    try:
        df_clean['date'] = pd.to_datetime(df_clean['date'], format='%d-%m-%Y')
        print(f"   ✓ Date converted successfully")
        print(f"   Date range: {df_clean['date'].min()} to {df_clean['date'].max()}")
    except Exception as e:
        print(f"   ✗ ERROR in date conversion: {str(e)}")
        return
    
    # Filter only target crops
    print(f"\n6. Filtering target crops: {TARGET_CROPS}")
    df_clean = df_clean[df_clean['commodity'].isin(TARGET_CROPS)]
    print(f"   ✓ Filtered to {len(df_clean)} rows")
    
    # Check for target crops found
    found_crops = df_clean['commodity'].unique()
    print(f"   Found crops: {list(found_crops)}")
    missing_crops = set(TARGET_CROPS) - set(found_crops)
    if missing_crops:
        print(f"   ⚠ Warning: Missing crops: {list(missing_crops)}")
    
    # Remove null values
    print("\n7. Removing null values...")
    initial_rows = len(df_clean)
    df_clean = df_clean.dropna()
    removed_rows = initial_rows - len(df_clean)
    print(f"   ✓ Removed {removed_rows} rows with null values")
    print(f"   Remaining rows: {len(df_clean)}")
    
    # Convert price columns to numeric (remove any non-numeric characters)
    print("\n8. Converting price columns to numeric...")
    price_columns = ['modal_price', 'min_price', 'max_price']
    for col in price_columns:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
    
    # Remove any rows where price conversion failed
    df_clean = df_clean.dropna(subset=price_columns)
    print(f"   ✓ Price columns converted")
    print(f"   Remaining rows: {len(df_clean)}")
    
    # Sort by date
    print("\n9. Sorting by date...")
    df_clean = df_clean.sort_values('date').reset_index(drop=True)
    print("   ✓ Data sorted chronologically")
    
    # Display statistics
    print("\n10. Data Statistics:")
    print(f"    Total records: {len(df_clean)}")
    print(f"    Date range: {df_clean['date'].min().strftime('%Y-%m-%d')} to {df_clean['date'].max().strftime('%Y-%m-%d')}")
    print(f"    Commodities: {df_clean['commodity'].nunique()}")
    print(f"    States: {df_clean['state'].nunique()}")
    print(f"    Markets: {df_clean['market'].nunique()}")
    print("\n    Records per commodity:")
    for crop in sorted(df_clean['commodity'].unique()):
        count = len(df_clean[df_clean['commodity'] == crop])
        print(f"      {crop}: {count}")
    
    # Save cleaned data
    print(f"\n11. Saving cleaned data to: {OUTPUT_FILE}")
    try:
        df_clean.to_csv(OUTPUT_FILE, index=False)
        print(f"    ✓ File saved successfully")
        print(f"    ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"    ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print("\n12. Sample of cleaned data (first 5 rows):")
    print(df_clean.head().to_string())
    
    print("\n" + "=" * 60)
    print("✓ DATA CLEANING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"Ready for STEP 2: Weather Data Integration")
    print("=" * 60)

if __name__ == "__main__":
    clean_price_data()
