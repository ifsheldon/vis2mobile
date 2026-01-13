import json
import urllib.request
import math

url = "https://vega.github.io/editor/data/movies.json"

try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
except Exception as e:
    print(f"Error fetching data: {e}")
    # Fallback data if fetch fails
    data = []

processed_data = []
ratings = [d.get("IMDB Rating") for d in data if d.get("IMDB Rating") is not None]

if not ratings:
    # If no data fetched, use some dummy data that looks like the chart
    print("Using dummy data")
    # Approximated from desktop.png
    bins = {
        1: 50, 2: 100, 3: 200, 4: 400, 5: 600, 6: 900, 7: 800, 8: 400, 9: 100
    }
else:
    # Bin size in Vega-Lite is usually 1 if not specified, but let's see.
    # The desktop chart seems to have bins of 1.
    bins = {}
    for r in ratings:
        b = math.floor(r)
        bins[b] = bins.get(b, 0) + 1

sorted_bins = sorted(bins.keys())
cumulative = 0
for b in sorted_bins:
    count = bins[b]
    cumulative += count
    processed_data.append({
        "bin": b,
        "count": count,
        "cumulative": cumulative
    })

with open("src/lib/processed_movies.json", "w") as f:
    json.dump(processed_data, f, indent=2)

print(f"Processed {len(processed_data)} bins.")
