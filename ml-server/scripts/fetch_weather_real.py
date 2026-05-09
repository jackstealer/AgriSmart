"""
Real Weather Data Fetching Script
Fetches historical weather data from Open-Meteo API (NO API KEY REQUIRED)
"""

import pandas as pd
import requests
import time
from datetime import datetime, timedelta
import os

# Define paths
PRICE_FILE = 'data/price_clean.csv'
OUTPUT_FILE = 'data/weather.csv'

# Open-Meteo Historical Weather API
API_BASE = "https://archive-api.open-meteo.com/v1/archive"

# Major agricultural regions in India with coordinates
# Using central coordinates for major agricultural states
REGIONS = {
    'Uttar Pradesh': {'lat': 26.8467, 'lon': 80.9462},  # Lucknow
    'Punjab': {'lat': 30.7333, 'lon': 76.7794},  # Chandigarh
    'Haryana': {'lat': 29.0588, 'lon': 76.0856},  # Rohtak
    'Bihar': {'lat': 25.5941, 'lon': 85.1376},  # Patna
    'West Bengal': {'lat': 22.5726, 'lon': 88.3639},  # Kolkata
    'Maharashtra': {'lat': 19.7515, 'lon': 75.7139},  # Aurangabad
    'Gujarat': {'lat': 23.0225, 'lon': 72.5714},  # Ahmedabad
    'Madhya Pradesh': {'lat': 23.2599, 'lon': 77.4126},  # Bhopal
    'Rajasthan': {'lat': 26.9124, 'lon': 75.7873},  # Jaipur
    'Karnataka': {'lat': 15.3173, 'lon': 75.7139},  # Hubli
    'Andhra Pradesh': {'lat': 16.5062, 'lon': 80.6480},  # Vijayawada
    'Tamil Nadu': {'lat': 11.1271, 'lon': 78.6569},  # Salem
    'Telangana': {'lat': 17.3850, 'lon': 78.4867},  # Hyderabad
    'Odisha': {'lat': 20.2961, 'lon': 85.8245},  # Bhubaneswar
    'Kerala': {'lat': 10.8505, 'lon': 76.2711},  # Thrissur
    'Assam': {'lat': 26.1445, 'lon': 91.7362},  # Guwahati
    'Jharkhand': {'lat': 23.6102, 'lon': 85.2799},  # Ranchi
    'Chhattisgarh': {'lat': 21.2514, 'lon': 81.6296},  # Raipur
    'Uttrakhand': {'lat': 30.0668, 'lon': 79.0193},  # Dehradun
    'Himachal Pradesh': {'lat': 31.1048, 'lon': 77.1734},  # Shimla
    'Jammu and Kashmir': {'lat': 34.0837, 'lon': 74.7973},  # Srinagar
    'Tripura': {'lat': 23.9408, 'lon': 91.9882},  # Agartala
    'Meghalaya': {'lat': 25.4670, 'lon': 91.3662},  # Shillong
    'Nagaland': {'lat': 25.6747, 'lon': 94.1086},  # Kohima
    'NCT of Delhi': {'lat': 28.7041, 'lon': 77.1025},  # Delhi
    'Goa': {'lat': 15.2993, 'lon': 74.1240},  # Panaji
}

def fetch_weather_for_location(lat, lon, start_date, end_date, location_name):
    """
    Fetch weather data from Open-Meteo API for a specific location
    """
    params = {
        'latitude': lat,
        'longitude': lon,
        'start_date': start_date,
        'end_date': end_date,
        'daily': 'temperature_2m_mean,precipitation_sum',
        'timezone': 'Asia/Kolkata'
    }
    
    try:
        response = requests.get(API_BASE, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Validate response structure
        if 'daily' not in data:
            print(f"   ⚠ Warning: No 'daily' key in response for {location_name}")
            return None
        
        daily = data['daily']
        
        # Check for required fields
        if 'time' not in daily or 'temperature_2m_mean' not in daily or 'precipitation_sum' not in daily:
            print(f"   ⚠ Warning: Missing required fields for {location_name}")
            return None
        
        # Create DataFrame
        df = pd.DataFrame({
            'date': pd.to_datetime(daily['time']),
            'temperature': daily['temperature_2m_mean'],
            'rainfall': daily['precipitation_sum']
        })
        
        return df
        
    except requests.exceptions.RequestException as e:
        print(f"   ✗ API Error for {location_name}: {str(e)}")
        return None
    except KeyError as e:
        print(f"   ✗ Data parsing error for {location_name}: Missing key {str(e)}")
        return None
    except Exception as e:
        print(f"   ✗ Unexpected error for {location_name}: {str(e)}")
        return None

def fetch_real_weather():
    """
    Fetch real weather data for all states in price dataset
    """
    print("=" * 60)
    print("STEP 2: REAL WEATHER DATA FETCHING (Open-Meteo API)")
    print("=" * 60)
    
    # Load price data to get date range and states
    print(f"\n1. Loading price data from: {PRICE_FILE}")
    try:
        df_price = pd.read_csv(PRICE_FILE)
        df_price['date'] = pd.to_datetime(df_price['date'])
        print(f"   ✓ Loaded {len(df_price)} price records")
    except FileNotFoundError:
        print(f"   ✗ ERROR: File not found: {PRICE_FILE}")
        print("   Please run STEP 1 (clean_price_data.py) first!")
        return
    except Exception as e:
        print(f"   ✗ ERROR: {str(e)}")
        return
    
    # Get date range
    start_date = df_price['date'].min().strftime('%Y-%m-%d')
    end_date = df_price['date'].max().strftime('%Y-%m-%d')
    print(f"\n2. Date range: {start_date} to {end_date}")
    
    # Get unique states
    unique_states = df_price['state'].unique()
    print(f"\n3. Found {len(unique_states)} unique states in dataset")
    
    # Fetch weather data for each state
    print(f"\n4. Fetching weather data from Open-Meteo API...")
    print(f"   API: {API_BASE}")
    print(f"   Note: This may take a minute...")
    
    weather_data = []
    successful = 0
    failed = 0
    
    for state in unique_states:
        # Get coordinates for this state
        if state not in REGIONS:
            print(f"   ⚠ No coordinates for '{state}', using Delhi as fallback")
            coords = REGIONS['NCT of Delhi']
        else:
            coords = REGIONS[state]
        
        print(f"   Fetching: {state} (lat={coords['lat']}, lon={coords['lon']})...")
        
        # Fetch weather data
        df_weather = fetch_weather_for_location(
            coords['lat'], 
            coords['lon'], 
            start_date, 
            end_date,
            state
        )
        
        if df_weather is not None:
            # Add state column
            df_weather['state'] = state
            weather_data.append(df_weather)
            successful += 1
            print(f"     ✓ Success: {len(df_weather)} days")
        else:
            failed += 1
            print(f"     ✗ Failed")
        
        # Rate limiting - be nice to the API
        time.sleep(0.5)
    
    print(f"\n5. API Fetch Summary:")
    print(f"   Successful: {successful}/{len(unique_states)}")
    print(f"   Failed: {failed}/{len(unique_states)}")
    
    if len(weather_data) == 0:
        print("\n   ✗ ERROR: No weather data fetched!")
        print("   Please check your internet connection and try again.")
        return
    
    # Combine all weather data
    print(f"\n6. Combining weather data...")
    df_weather_all = pd.concat(weather_data, ignore_index=True)
    print(f"   ✓ Combined {len(df_weather_all)} weather records")
    
    # Merge with price data to get state-date combinations
    print(f"\n7. Matching weather data with price records...")
    df_price_dates = df_price[['date', 'state', 'market']].drop_duplicates()
    
    # Merge on date and state
    df_final = pd.merge(
        df_price_dates,
        df_weather_all,
        on=['date', 'state'],
        how='left'
    )
    
    print(f"   ✓ Matched {len(df_final)} records")
    
    # Check for missing values
    print(f"\n8. Data Quality Check:")
    missing = df_final.isnull().sum()
    if missing.sum() == 0:
        print("   ✓ No missing values")
    else:
        print("   Missing values found:")
        for col, count in missing[missing > 0].items():
            pct = (count / len(df_final)) * 100
            print(f"     {col}: {count} ({pct:.1f}%)")
        
        # Forward fill missing values
        print("\n   Applying forward fill for missing values...")
        df_final = df_final.sort_values(['state', 'date'])
        df_final['temperature'] = df_final.groupby('state')['temperature'].fillna(method='ffill')
        df_final['rainfall'] = df_final.groupby('state')['rainfall'].fillna(method='ffill')
        
        # Backward fill if still missing
        df_final['temperature'] = df_final.groupby('state')['temperature'].fillna(method='bfill')
        df_final['rainfall'] = df_final.groupby('state')['rainfall'].fillna(method='bfill')
        
        remaining_nulls = df_final.isnull().sum().sum()
        print(f"   ✓ Remaining nulls: {remaining_nulls}")
    
    # Display statistics
    print(f"\n9. Weather Data Statistics:")
    print(f"   Temperature range: {df_final['temperature'].min():.1f}°C to {df_final['temperature'].max():.1f}°C")
    print(f"   Average temperature: {df_final['temperature'].mean():.1f}°C")
    print(f"   Rainfall range: {df_final['rainfall'].min():.1f}mm to {df_final['rainfall'].max():.1f}mm")
    print(f"   Average rainfall: {df_final['rainfall'].mean():.1f}mm")
    print(f"   Days with rain (>0mm): {(df_final['rainfall'] > 0).sum()}")
    
    # Save weather data
    print(f"\n10. Saving weather data to: {OUTPUT_FILE}")
    try:
        # Create output directory if needed
        os.makedirs('data', exist_ok=True)
        
        df_final.to_csv(OUTPUT_FILE, index=False)
        print(f"    ✓ File saved successfully")
        print(f"    ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"    ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print(f"\n11. Sample of weather data (first 5 rows):")
    print(df_final.head().to_string())
    
    print("\n" + "=" * 60)
    print("✓ REAL WEATHER DATA FETCHING COMPLETED")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"Data source: Open-Meteo Historical Weather API")
    print(f"Ready for STEP 3: Inflation Data")
    print("=" * 60)

if __name__ == "__main__":
    fetch_real_weather()
