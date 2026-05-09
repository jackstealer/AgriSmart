import pandas as pd

df = pd.read_csv("../data/final_dataset.csv")

# Convert date
df['date'] = pd.to_datetime(df['date'])

# Sort properly
df = df.sort_values(by=["commodity", "date"])

# 🔥 LAG FEATURES (past prices)
df['lag_1'] = df.groupby('commodity')['price'].shift(1)
df['lag_7'] = df.groupby('commodity')['price'].shift(7)
df['lag_14'] = df.groupby('commodity')['price'].shift(14)

# 🔥 ROLLING AVERAGE
df['rolling_mean_7'] = df.groupby('commodity')['price'].transform(lambda x: x.rolling(7).mean())
df['rolling_mean_14'] = df.groupby('commodity')['price'].transform(lambda x: x.rolling(14).mean())

# Drop NA (important after lagging)
df = df.dropna()

# 🔥 ENCODING categorical data
df = pd.get_dummies(df, columns=["commodity", "season", "State", "Market"])

# Save
df.to_csv("../data/final_features.csv", index=False)

print("✅ Feature engineering done")