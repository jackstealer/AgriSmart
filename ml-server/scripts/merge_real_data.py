"""
Data Merging Script - Real Data Only
Merges price, weather, and inflation data (all from real APIs)
"""

import pandas as pd
import numpy as np
import os

# Define paths
PRICE_FILE = 'data/price_clean.csv'
WEATHER_FILE = 'data/weather.csv'
INFLATION_FILE = 'data/inflation.csv'
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

def merge_real_data():
    """
    Merge all real data: price + weather + inflation
    """
    print("=" * 60)
    print("STEPS 4 & 5: MERGE REAL DATA")
    print("=" * 60)
    
    # Load price data
    print(f"\n1. Loading price data from: {PRICE_FILE}")
    try:
        df_price = pd.read_csv(PRICE_FILE)
        df_price['date'] = pd.to_datetime(df_price['date'])
        print(f"   ✓ Loaded {len(df_price)} price records")
        print(f"   Columns: {list(df_price.columns)}")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {PRICE_FILE}")
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
        print(f"   Columns: {list(df_weather.columns)}")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {WEATHER_FILE}")
        print("   Please run STEP 2 (fetch_weather_real.py) first!")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Load inflation data
    print(f"\n3. Loading inflation data from: {INFLATION_FILE}")
    try:
        df_inflation = pd.read_csv(INFLATION_FILE)
        df_inflation['date'] = pd.to_datetime(df_inflation['date'])
        print(f"   ✓ Loaded {len(df_inflation)} inflation records")
        print(f"   Columns: {list(df_inflation.columns)}")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {INFLATION_FILE}")
        print("   Please run STEP 3 (fetch_inflation_real.py) first!")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Merge price and weather data
    print("\n4. Merging price and weather data...")
    print(f"   Merge keys: date, state, market")
    
    df_merged = pd.merge(
        df_price,
        df_weather,
        on=['date', 'state', 'market'],
        how='left'
    )
    
    print(f"   ✓ Merged shape: {df_merged.shape}")
    print(f"   ✓ Total records: {len(df_merged)}")
    
    # Merge with inflation data
    print("\n5. Merging with inflation data...")
    print(f"   Merge key: date")
    
    df_merged = pd.merge(
        df_merged,
        df_inflation,
        on='date',
        how='left'
    )
    
    print(f"   ✓ Final merged shape: {df_merged.shape}")
    print(f"   ✓ Total records: {len(df_merged)}")
    
    # Check for missing values after merge
    print("\n6. Checking for missing values after merge...")
    missing_before = df_merged.isnull().sum()
    if missing_before.sum() > 0:
        print("   Missing values found:")
        for col, count in missing_before[missing_before > 0].items():
            pct = (count / len(df_merged)) * 100
            print(f"     {col}: {count} ({pct:.1f}%)")
    else:
        print("   ✓ No missing values")
    
    # Add season feature
    print("\n7. Adding season feature...")
    df_merged['month'] = df_merged['date'].dt.month
    df_merged['season'] = df_merged['month'].apply(get_season)
    print("   ✓ Season feature added")
    
    # Display season distribution
    print("\n   Season distribution:")
    season_counts = df_merged['season'].value_counts()
    for season, count in season_counts.items():
        print(f"     {season}: {count}")
    
    # Handle missing values (forward fill)
    print("\n8. Handling missing values (forward fill)...")
    initial_nulls = df_merged.isnull().sum().sum()
    
    if initial_nulls > 0:
        # Sort by date, commodity, state, market for proper forward fill
        df_merged = df_merged.sort_values(['commodity', 'state', 'market', 'date'])
        
        # Forward fill within each commodity-state-market group
        numeric_cols = ['temperature', 'rainfall', 'inflation_rate']
        for col in numeric_cols:
            if col in df_merged.columns and df_merged[col].isnull().any():
                df_merged[col] = df_merged.groupby(['commodity', 'state', 'market'])[col].ffill()
                df_merged[col] = df_merged.groupby(['commodity', 'state', 'market'])[col].bfill()
        
        final_nulls = df_merged.isnull().sum().sum()
        print(f"   ✓ Filled {initial_nulls - final_nulls} missing values")
        
        if final_nulls > 0:
            print(f"   ⚠ Still {final_nulls} missing values remaining")
            # Fill with column mean as last resort
            for col in numeric_cols:
                if col in df_merged.columns and df_merged[col].isnull().any():
                    mean_val = df_merged[col].mean()
                    df_merged[col] = df_merged[col].fillna(mean_val)
                    print(f"     Filled {col} with mean: {mean_val:.2f}")
    else:
        print("   ✓ No missing values to handle")
    
    # Sort by date
    print("\n9. Sorting by date...")
    df_merged = df_merged.sort_values('date').reset_index(drop=True)
    print("   ✓ Data sorted chronologically")
    
    # Display final statistics
    print("\n10. Final Dataset Statistics:")
    print(f"    Total records: {len(df_merged)}")
    print(f"    Columns: {len(df_merged.columns)}")
    print(f"    Date range: {df_merged['date'].min().strftime('%Y-%m-%d')} to {df_merged['date'].max().strftime('%Y-%m-%d')}")
    print(f"    Commodities: {df_merged['commodity'].nunique()}")
    print(f"    States: {df_merged['state'].nunique()}")
    print(f"    Markets: {df_merged['market'].nunique()}")
    
    print("\n    Column list:")
    for col in df_merged.columns:
        print(f"      - {col}")
    
    print("\n    Data types:")
    print(df_merged.dtypes.to_string())
    
    # Data source summary
    print("\n11. Data Sources (ALL REAL):")
    print("    ✓ Price data: Original CSV dataset")
    print("    ✓ Weather data: Open-Meteo Historical API")
    print("    ✓ Inflation data: World Bank API")
    print("    ✓ Season: Calculated from date")
    
    # Save merged data
    print(f"\n12. Saving merged data to: {OUTPUT_FILE}")
    try:
        df_merged.to_csv(OUTPUT_FILE, index=False)
        print(f"    ✓ File saved successfully")
        print(f"    ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"    ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print("\n13. Sample of merged data (first 5 rows):")
    sample_cols = ['date', 'commodity', 'modal_price', 'temperature', 'rainfall', 'inflation_rate', 'season']
    print(df_merged[sample_cols].head().to_string())
    
    print("\n" + "=" * 60)
    print("✓ DATA MERGING COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"All data sources: REAL APIs (no synthetic data)")
    print(f"Ready for STEP 6: Feature Engineering")
    print("=" * 60)

if __name__ == "__main__":
    merge_real_data()
