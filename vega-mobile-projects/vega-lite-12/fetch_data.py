import pandas as pd
import json

url = "https://vega.github.io/editor/data/weather.csv"
df = pd.read_csv(url)

# Filter for Seattle
df = df[df['location'] == 'Seattle']

# Convert date to datetime
df['date'] = pd.to_datetime(df['date'])

# Extract month
df['month'] = df['date'].dt.month

# Group by month and calculate averages
monthly = df.groupby('month').agg({
    'temp_max': 'mean',
    'temp_min': 'mean',
    'precipitation': 'mean'
}).reset_index()

# Map month number to name
month_map = {
    1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
    7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
}
monthly['month_name'] = monthly['month'].map(month_map)

# Prepare result
result = []
for _, row in monthly.iterrows():
    result.append({
        "month": row['month_name'],
        "temp_max": round(row['temp_max'], 1),
        "temp_min": round(row['temp_min'], 1),
        "precipitation": round(row['precipitation'], 2)
    })

print(json.dumps(result, indent=2))
