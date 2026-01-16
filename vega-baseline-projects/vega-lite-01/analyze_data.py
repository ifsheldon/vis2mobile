import json
import sys
import urllib.request

url = 'https://vega.github.io/editor/data/unemployment-across-industries.json'
with urllib.request.urlopen(url) as response:
    data = json.loads(response.read().decode())

counts = {}
for d in data:
    s = d['series']
    counts[s] = counts.get(s, 0) + d['count']

sorted_series = sorted(counts.items(), key=lambda x: x[1], reverse=True)
for s, c in sorted_series:
    print(f"{s}: {c}")