import csv
import json

data = []
with open('stocks.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        row['price'] = float(row['price'])
        data.append(row)

with open('src/lib/stocks.json', 'w') as f:
    json.dump(data, f, indent=2)
