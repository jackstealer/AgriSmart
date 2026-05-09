"""
Weather Data Generation Script
Generates realistic synthetic weather data aligned with price data dates
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Define paths
PRICE_FILE = 'data/price_clean.csv'
OUTPUT_FILE = 'data/weather.csv'

# Indian states and their typical monsoon season weather patterns
STATE_WEATHER_PATTERNS = {
    'monsoon': {  # July-August period
        'temperature': {'mean': 28, 'std': 3, 'min': 22, 'max': 35},
        'rainfall': {'mean': 8, 'std': 5, 'min': 0, 'max': 25}
    }
}

def generate_weather_data():
    """
    Generate realistic weather data for each date, state, and market in price data
    """
    print("=" * 60)
    print("STEP 2: WEATHER DATA GENERATION")
    print("=" * 60)
    
    # Load cleaned price data
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
    
    # Get unique combinations of date, state, market
    print("\n2. Extracting unique date-state-market combinations...")
    unique_locations = df_price[['date', 'state', 'market']].drop_duplicates()
    print(f"   ✓ Found {len(unique_locations)} unique location-date combinations")
    
    # Generate weather data
    print("\n3. Generating realistic weather data...")
    weather_data = []
    
    np.random.seed(42)  # For reproducibility
    
    for idx, row in unique_locations.iterrows():
        date = row['date']
        state = row['state']
        market = row['market']
        
        # Determine season (July-August = monsoon in India)
        month = date.month
        if month in [7, 8]:
            season = 'monsoon'
        else:
            season = 'monsoon'  # Default for this dataset
        
        # Get weather pattern for the season
        pattern = STATE_WEATHER_PATTERNS[season]
        
        # Generate temperature (in Celsius)
        temp_mean = pattern['temperature']['mean']
        temp_std = pattern['temperature']['std']
        temp_min = pattern['temperature']['min']
        temp_max = pattern['temperature']['max']
        
        temperature = np.random.normal(temp_mean, temp_std)
        temperature = np.clip(temperature, temp_min, temp_max)
        temperature = round(temperature, 1)
        
        # Generate rainfall (in mm)
        # Using exponential distribution for rainfall (more realistic)
        rainfall_mean = pattern['rainfall']['mean']
        rainfall = np.random.exponential(rainfall_mean)
        rainfall = np.clip(rainfall, 0, pattern['rainfall']['max'])
        rainfall = round(rainfall, 1)
        
        # Add some regional variation
        # Coastal states get more rain
        coastal_states = ['Gujarat', 'Maharashtra', 'Goa', 'Karnataka', 'Kerala', 
                         'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal']
        if state in coastal_states:
            rainfall *= 1.3
            temperature -= 1
        
        # Northern states are slightly cooler
        northern_states = ['Jammu and Kashmir', 'Himachal Pradesh', 'Punjab', 
                          'Haryana', 'Uttarakhand', 'Delhi']
        if state in northern_states:
            temperature -= 2
        
        weather_data.append({
            'date': date,
            'state': state,
            'market': market,
            'temperature': round(temperature, 1),
            'rainfall': round(rainfall, 1)
        })
    
    # Create DataFrame
    df_weather = pd.DataFrame(weather_data)
    print(f"   ✓ Generated weather data for {len(df_weather)} records")
    
    # Display statistics
    print("\n4. Weather Data Statistics:")
    print(f"   Temperature range: {df_weather['temperature'].min()}°C to {df_weather['temperature'].max()}°C")
    print(f"   Average temperature: {df_weather['temperature'].mean():.1f}°C")
    print(f"   Rainfall range: {df_weather['rainfall'].min()}mm to {df_weather['rainfall'].max()}mm")
    print(f"   Average rainfall: {df_weather['rainfall'].mean():.1f}mm")
    print(f"   Days with rain (>0mm): {(df_weather['rainfall'] > 0).sum()}")
    
    # Check for missing values
    print("\n5. Data Quality Check:")
    missing = df_weather.isnull().sum()
    if missing.sum() == 0:
        print("   ✓ No missing values")
    else:
        print(f"   ⚠ Missing values found:")
        print(missing[missing > 0])
    
    # Save weather data
    print(f"\n6. Saving weather data to: {OUTPUT_FILE}")
    try:
        df_weather.to_csv(OUTPUT_FILE, index=False)
        print(f"   ✓ File saved successfully")
        print(f"   ✓ File size: {os.path.getsize(OUTPUT_FILE) / 1024:.2f} KB")
    except Exception as e:
        print(f"   ✗ ERROR saving file: {str(e)}")
        return
    
    # Display sample data
    print("\n7. Sample of weather data (first 10 rows):")
    print(df_weather.head(10).to_string())
    
    # Display weather by state (summary)
    print("\n8. Average weather by state (top 10 states):")
    state_summary = df_weather.groupby('state').agg({
        'temperature': 'mean',
        'rainfall': 'mean'
    }).round(1).sort_values('rainfall', ascending=False).head(10)
    print(state_summary.to_string())
    
    print("\n" + "=" * 60)
    print("✓ WEATHER DATA GENERATION COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print(f"\nOutput file: {OUTPUT_FILE}")
    print(f"Ready for STEP 3: Merge Data")
    print("=" * 60)

if __name__ == "__main__":
    generate_weather_data()
