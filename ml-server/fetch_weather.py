import pandas as pd
import requests

lat, lon = 28.6139, 77.2090

url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOT,PRECTOTCORR&community=AG&longitude={lon}&latitude={lat}&start=20180101&end=20231231&format=JSON"

response = requests.get(url)
data = response.json()

weather_data = data['properties']['parameter']

# SAFE RAINFALL KEY
rainfall_key = 'PRECTOT' if 'PRECTOT' in weather_data else 'PRECTOTCORR'

df = pd.DataFrame({
    "date": list(weather_data['T2M'].keys()),
    "temperature": list(weather_data['T2M'].values()),
    "rainfall": list(weather_data[rainfall_key].values())
})

df['date'] = pd.to_datetime(df['date'])

df.to_csv("../data/weather.csv", index=False)

print("✅ weather.csv created successfully")