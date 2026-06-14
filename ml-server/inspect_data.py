import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import pandas as pd
import numpy as np

print("=" * 70)
print("DATASET 1: Agriculture_price_dataset.csv  (AGMARKNET 2023-2025)")
print("=" * 70)
df1 = pd.read_csv('price-data/Agriculture_price_dataset.csv', encoding='utf-8',
                   on_bad_lines='skip', low_memory=False)
print(f"Shape: {df1.shape}")
print(f"Commodities ({df1['Commodity'].nunique()}): {sorted(df1['Commodity'].unique())}")
print(f"States ({df1['STATE'].nunique()}): {sorted(df1['STATE'].str.strip().unique())}")
print(f"Date range: {df1['Price Date'].min()} to {df1['Price Date'].max()}")
print(f"Modal_Price stats:\n{df1['Modal_Price'].describe()}")

print("\n" + "=" * 70)
print("DATASET 2: dataset_indian_crop_price.csv  (48K with weather)")
print("=" * 70)
df2 = pd.read_csv('price-data/dataset_indian_crop_price.csv', encoding='cp1252',
                   on_bad_lines='skip', low_memory=False)
print(f"Shape: {df2.shape}")
print(f"Columns: {list(df2.columns)}")
print(f"Crop Types ({df2['Crop Type'].nunique()}): {sorted(df2['Crop Type'].unique())}")
print(f"States ({df2['State'].nunique()}): {sorted(df2['State'].unique())}")
print(f"Seasons: {df2['Season'].value_counts().to_dict()}")
price_col = [c for c in df2.columns if 'Price' in c and 'ton' in c][0]
print(f"Price col: '{price_col}'")
print(f"Price stats:\n{df2[price_col].describe()}")
print(f"\nSample:\n{df2.head(3).to_string()}")

print("\n" + "=" * 70)
print("DATASET 3: Price_Agriculture_commodities_Week.csv  (23K mandi weekly)")
print("=" * 70)
df3 = pd.read_csv('price-data/Price_Agriculture_commodities_Week.csv', encoding='utf-8',
                   on_bad_lines='skip', low_memory=False)
print(f"Shape: {df3.shape}")
print(f"Commodities ({df3['Commodity'].nunique()}): {sorted(df3['Commodity'].unique())}")
print(f"States ({df3['State'].nunique()}): {sorted(df3['State'].unique())}")
