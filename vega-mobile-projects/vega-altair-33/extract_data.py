import pandas as pd
import requests
import json
import os

def extract_data():
    # 1. Fetch and process airport data
    airports_url = "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/airports.csv"
    print(f"Fetching airports data from {airports_url}...")
    df = pd.read_csv(airports_url)
    
    # Aggregation as per Vega spec:
    # {"aggregate": [{"op": "mean", "field": "latitude", "as": "latitude"}, 
    #                {"op": "mean", "field": "longitude", "as": "longitude"}, 
    #                {"op": "count", "as": "count"}], "groupby": ["state"]}
    
    aggregated = df.groupby('state').agg(
        latitude=('latitude', 'mean'),
        longitude=('longitude', 'mean'),
        count=('state', 'count')
    ).reset_index()
    
    # Convert to list of dicts
    data_list = aggregated.to_dict(orient='records')
    
    os.makedirs('src/lib', exist_ok=True)
    with open('src/lib/airports_aggregated.json', 'w') as f:
        json.dump(data_list, f, indent=2)
    print("Saved aggregated airports data to src/lib/airports_aggregated.json")

    # 2. Fetch US map data
    us_map_url = "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json"
    print(f"Fetching US map data from {us_map_url}...")
    response = requests.get(us_map_url)
    if response.status_code == 200:
        os.makedirs('public', exist_ok=True)
        with open('public/us-10m.json', 'wb') as f:
            f.write(response.content)
        print("Saved US map data to public/us-10m.json")
    else:
        print(f"Failed to fetch US map data: {response.status_code}")

if __name__ == "__main__":
    extract_data()
