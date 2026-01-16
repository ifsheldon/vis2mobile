import json

with open('src/lib/data.json', 'r') as f:
    data = json.load(f)

# Group by x
transformed = {}
for item in data:
    x = item['x']
    if x not in transformed:
        transformed[x] = {'x': x}
    transformed[x][item['category']] = item['y']

# Convert to list and sort by x
final_data = sorted(list(transformed.values()), key=lambda d: d['x'])

with open('src/lib/data.ts', 'w') as f:
    f.write('export const data = ' + json.dumps(final_data, indent=2) + ';\n')