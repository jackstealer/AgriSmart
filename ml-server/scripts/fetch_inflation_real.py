"""
Real Inflation Data Fetching Script
Fetches inflation data from World Bank API (NO API KEY REQUIRED)
"""

import pandas as pd
import requests
import json
from datetime import datetime, timedelta
import os

# Define paths
PRICE_FILE = 'data/price_clean.csv'
OUTPUT_FILE = 'data/inflation.csv'

# World Bank API
API_BASE = "https://api.worldbank.org/v2/country/IND/indicator/FP.CPI.TOTL.ZG"

def fetch_inflation_data(start_year, end_year):
    """
    Fetch inflation data from World Bank API
    """
    params = {
        'format': 'json',
        'date': f'{start_year}:{end_year}',
        'per_page': 100
    }
    
    try:
        print(f"   Fetching inflation data for {start_year}-{end_year}...")
        response = requests.get(API_BASE, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # World Bank API returns array with metadata and data
        if not isinstance(data, list) or len(data) < 2:
            print(f"   ⚠ Warning: Unexpected API response format")
            return None
        
        # Second element contains the actual data
        inflation_data = data[1]
        
        if not inflation_data:
            print(f"   ⚠ Warning: No inflation data returned")
            return None
        
        # Parse inflation data
        records = []
        for item in inflation_data:
            if item.get('value') is not None:
                records.append({
                    'year': int(item['date']),
                    'inflation_rate': float(item['value'])
                })
        
        if not records:
            print(f"   ⚠ Warning: No valid inflation records found")
            return None
        
        df = pd.DataFrame(records)
        df = df.sort_values('year')
        
        print(f"   ✓ Fetched {len(df)} years of inflation data")
        return df
        
    except requests.exceptions.RequestException as e:
        print(f"   ✗ API Error: {str(e)}")
        return None
    except (KeyError, ValueError, json.JSONDecodeError) as e:
        print(f"   ✗ Data parsing error: {str(e)}")
        return None
    except Exception as e:
        print(f"   ✗ Unexpected error: {str(e)}")
        return None

def expand_yearly_to_daily(df_yearly, start_date, end_date):
    """
    Expand yearly inflation data to daily using forward fill
    """
    # Create date range
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Create daily dataframe
    df_daily = pd.DataFrame({'date': date_range})
    df_daily['year'] = df_daily['date'].dt.year
    
    # Merge with yearly data
    df_daily = pd.merge(df_daily, df_yearly, on='year', how='left')
    
    # Forward fill missing values
    df_daily['inflation_rate'] = df_daily['inflation_rate'].fillna(method='ffill')
    
    # Backward fill if still missing (for dates before first year)
    df_daily['inflation_rate'] = df_daily['inflation_rate'].fillna(method='bfill')
    
    # Drop year column
    df_daily = df_daily[['date', 'inflation_rate']]
    
    return df_daily

def fetch_real_inflation():
    """
    Fetch real inflation data from World Bank API
    """
    print("=" * 60)
    print("STEP 3: REAL INFLATION DATA FETCHING (World Bank API)")
    print("=" * 60)
    
    # Load price data to get date range
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
    
    # Get date range
    start_date = df_price['date'].min()
    end_date = df_price['date'].max()
    start_year = start_date.year
    end_year = end_date.year
    
    print(f"\n2. Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"   Years needed: {start_year} to {end_year}")
    
    # Fetch inflation data from World Bank
    print(f"\n3. Fetching inflation data from World Bank API...")
    print(f"   API: {API_BASE}")
    print(f"   Indicator: FP.CPI.TOTL.ZG (Inflation, consumer prices)")
    
    # Fetch a wider range to ensure we have data
    fetch_start_year = start_year - 2
    fetch_end_year = end_year + 1
    
    df_inflation = fetch_inflation_data(fetch_start_year, fetch_end_year)
    
    if df_inflation is None:
        print("\n   ✗ ERROR: Failed to fetch inflation data!")
        print("   Trying alternative approach with recent years...")
        
        # Try fetching last 10 years as fallback
        current_year = datetime.now().year
        df_inflation = fetch_inflation_data(current_year - 10, current_year)
        
        if df_inflation is None:
            print("\n   ✗ ERROR: Could not fetch inflation data from World Bank API")
            print("   Please check your internet connection and try again.")
            return
    
    # Display fetched data
    print(f"\n4. Inflation Data Summary:")
    print(f"   Years available: {df_inflation['year'].min()} to {df_inflation['year'].max()}")
    print(f"   Inflation rate range: {df_inflation['inflation_rate'].min():.2f}% to {df_inflation['inflation_rate'].max():.2f}%")
    print("\n   Yearly inflation rates:")
    for _, row in df_inflation.iterrows():
        print(f"     {int(row['year'])}: {row['inflation_rate']:.2f}%")
    
    # Expand yearly data to daily
    print(f"\n5. Expanding yearly data to daily (forward fill)...")
    df_daily = expand_yearly_to_daily(
        df_inflation,
        start_date.strftime('%Y-%m-%d'),
        end_date.strftime('%Y-%m-%d')
    )
    
    print(f"   ✓ Created {len(df_daily)} daily records")
    
    # Check for missing values
    print(f"\n6. Data Quality Check:")
    missing = df_daily.isnull().sum()
    if missing.sum() == 0:
        print("   ✓ No missing values")
    else:
        print("   Missing values found:")
        for col, count in missing[missing > 0].items():
            pct = (count / len(df_daily)) * 100
            print(f"     {col}: {count} ({pct:.1f}%)")
        
        # Fill with mean if still missing
        if df_daily['inflation_rate'].isnull().any():
            mean_inflation = df_daily['inflation_rate'].mean()
            df_daily['inflation_rate'] = df_daily['inflation_rate'].fillna(mean_inflation)
            print(f"   ✓ Filled missing values with mean: {mean_inflation:.2f}%")
    
    # Display statistics
    print(f"\n7. Daily Inflation Data Statistics:")
    print(f"   Date range: {df_daily['date'].min().strftime('%Y-%m-%d')} to {df_daily['date'].max().strftime('%Y-%m-%d')}")
    print(f"   Inflation rate: {df_daily['inflation_rate'].iloc[0]:.2f}% (constant for this period)")
    print(f"   Total days: {len(df_daily)}")
    
    # Save inflation data
    print(f"\n8. Saving inflation data to: {OUTPUT_FILE}")
    try:
        # Create output directory if needed
        os.makedirs('data', exist_ok=True)
        
        df_daily.to_csv(OUTPUT_FILE, index=False)
        print(f"   ✓ File saved successfully")
        print(f"   ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"   ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print(f"\n9. Sample of inflation data (first 5 rows):")
    print(df_daily.head().to_string())
    
    print("\n" + "=" * 60)
    print("✓ REAL INFLATION DATA FETCHING COMPLETED")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"Data source: World Bank API")
    print(f"Ready for STEP 4: Demand/Arrival Data")
    print("=" * 60)

if __name__ == "__main__":
    fetch_real_inflation()
