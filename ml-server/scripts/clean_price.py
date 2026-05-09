import pandas as pd

df = pd.read_csv("../price-data/Price_Agriculture_commodities_Week.csv")

# Rename columns
df = df.rename(columns={
    "Arrival_Date": "date",
    "Commodity": "commodity",
    "Modal Price": "price",
    "Min Price": "min_price",
    "Max Price": "max_price"
})

# Convert date
df['date'] = pd.to_datetime(df['date'], dayfirst=True, errors='coerce')

# Select important columns
df = df[[
    "date",
    "commodity",
    "price",
    "min_price",
    "max_price",
    "State",
    "Market"
]]

# Filter only required crops
crops = ["Potato", "Onion", "Wheat", "Rice", "Maize", "Tomato"]
df = df[df['commodity'].isin(crops)]

# Remove missing values
df = df.dropna()

# Sort data (VERY IMPORTANT for time series)
df = df.sort_values(by="date")

# Save cleaned data
df.to_csv("../data/price_clean.csv", index=False)

print("✅ Clean price dataset ready")