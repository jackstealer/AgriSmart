"""
Data Merging Script
Merges price and weather data, adds seasonal features
"""

import pandas as pd
import numpy as np
import os

# Define paths
PRICE_FILE = 'data/price_clean.csv'
WEATHER_FILE = 'data/weather.csv'
OUTPUT_FILE = 'data/final_dataset.csv'

def get_season(month):
    """
    Determine season based on month (Indian seasons)
    """
    if month in [12, 1, 2]:
        return 'winter'
    elif month in [3, 4, 5, 6]:
        return 'summer'
    elif month in [7, 8, 9]:
        return 'monsoon'
    else:  # [10, 11]
        return 'post_monsoon'

def merge_data():
    """
    Merge price and weather data, add seasonal features
    """
    print("=" * 60)
    print("STEP 3: MERGE DATA")
    print("=" * 60)
    
    # Load price data
    print(f"\n1. Loading price data from: {PRICE_FILE}")
    try:
        df_price = pd.read_csv(PRICE_FILE)
        df_price['date'] = pd.to_datetime(df_price['date'])
        print(f"   ✓ Loaded {len(df_price)} price records")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {PRICE_FILE}")
        print("   Please run STEP 1 first!")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Load weather data
    print(f"\n2. Loading weather data from: {WEATHER_FILE}")
    try:
        df_weather = pd.read_csv(WEATHER_FILE)
        df_weather['date'] = pd.to_datetime(df_weather['date'])
        print(f"   ✓ Loaded {len(df_weather)} weather records")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {WEATHER_FILE}")
        print("   Please run STEP 2 first!")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Merge datasets on date, state, and market
    print("\n3. Merging price and weather data...")
    print(f"   Merge keys: date, state, market")
    
    df_merged = pd.merge(
        df_price,
        df_weather,
        on=['date', 'state', 'market'],
        how='left'
    )
    
    print(f"   ✓ Merged dataset shape: {df_merged.shape}")
    print(f"   ✓ Total records: {len(df_merged)}")
    
    # Check for missing values after merge
    print("\n4. Checking for missing values after merge...")
    missing_before = df_merged.isnull().sum()
    if missing_before.sum() > 0:
        print("   ⚠ Missing values found:")
        for col, count in missing_before[missing_before > 0].items():
            print(f"     {col}: {count}")
    else:
        print("   ✓ No missing values")
    
    # Add season feature
    print("\n5. Adding season feature...")
    df_merged['month'] = df_merged['date'].dt.month
    df_merged['season'] = df_merged['month'].apply(get_season)
    print("   ✓ Season feature added")
    
    # Display season distribution
    print("\n   Season distribution:")
    season_counts = df_merged['season'].value_counts()
    for season, count in season_counts.items():
        print(f"     {season}: {count}")
    
    # Handle missing values (forward fill)
    print("\n6. Handling missing values (forward fill)...")
    initial_nulls = df_merged.isnull().sum().sum()
    
    if initial_nulls > 0:
        # Sort by date, commodity, state, market for proper forward fill
        df_merged = df_merged.sort_values(['commodity', 'state', 'market', 'date'])
        
        # Forward fill within each commodity-state-market group
        df_merged = df_merged.groupby(['commodity', 'state', 'market']).apply(
            lambda x: x.fillna(method='ffill')
        ).reset_index(drop=True)
        
        # If still missing, use backward fill
        df_merged = df_merged.groupby(['commodity', 'state', 'market']).apply(
            lambda x: x.fillna(method='bfill')
        ).reset_index(drop=True)
        
        final_nulls = df_merged.isnull().sum().sum()
        print(f"   ✓ Filled {initial_nulls - final_nulls} missing values")
        
        if final_nulls > 0:
            print(f"   ⚠ Still {final_nulls} missing values remaining")
            # Drop remaining nulls
            df_merged = df_merged.dropna()
            print(f"   ✓ Dropped rows with remaining nulls")
    else:
        print("   ✓ No missing values to handle")
    
    # Sort by date
    print("\n7. Sorting by date...")
    df_merged = df_merged.sort_values('date').reset_index(drop=True)
    print("   ✓ Data sorted chronologically")
    
    # Display final statistics
    print("\n8. Final Dataset Statistics:")
    print(f"   Total records: {len(df_merged)}")
    print(f"   Columns: {len(df_merged.columns)}")
    print(f"   Date range: {df_merged['date'].min().strftime('%Y-%m-%d')} to {df_merged['date'].max().strftime('%Y-%m-%d')}")
    print(f"   Commodities: {df_merged['commodity'].nunique()}")
    print(f"   States: {df_merged['state'].nunique()}")
    print(f"   Markets: {df_merged['market'].nunique()}")
    
    print("\n   Column list:")
    for col in df_merged.columns:
        print(f"     - {col}")
    
    print("\n   Data types:")
    print(df_merged.dtypes.to_string())
    
    # Save merged data
    print(f"\n9. Saving merged data to: {OUTPUT_FILE}")
    try:
        df_merged.to_csv(OUTPUT_FILE, index=False)
        print(f"   ✓ File saved successfully")
        print(f"   ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"   ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print("\n10. Sample of merged data (first 5 rows):")
    print(df_merged.head().to_string())
    
    print("\n" + "=" * 60)
    print("✓ DATA MERGING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"Ready for STEP 4: Feature Engineering")
    print("=" * 60)

if __name__ == "__main__":
    merge_data()
