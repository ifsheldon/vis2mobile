import json
import re

with open('original_visualization/desktop.html', 'r') as f:
    content = f.read()

# Extract the spec object
match = re.search(r'var spec = (\{.*?\});', content, re.DOTALL)
if match:
    spec = json.loads(match.group(1))
    with open('src/lib/original_spec.json', 'w') as f:
        json.dump(spec, f, indent=2)
    
    # Extract the dataset
    dataset_name = spec['data']['name']
    data = spec['datasets'][dataset_name]
    with open('src/lib/data.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully extracted data with {len(data)} rows.")
else:
    print("Could not find spec in desktop.html")
