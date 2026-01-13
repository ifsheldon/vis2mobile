import json
import statistics

with open('penguins.json', 'r') as f:
    data = json.load(f)

species_data = {}
for entry in data:
    s = entry.get('Species')
    bm = entry.get('Body Mass (g)')
    if s and bm is not None:
        if s not in species_data:
            species_data[s] = []
        species_data[s].append(bm)

results = {}
for s, values in species_data.items():
    values.sort()
    n = len(values)
    res = {
        'min': min(values),
        'max': max(values),
        'median': statistics.median(values),
        'q1': statistics.quantiles(values, n=4)[0],
        'q3': statistics.quantiles(values, n=4)[2],
        'count': n
    }
    results[s] = res

print(json.dumps(results, indent=2))
