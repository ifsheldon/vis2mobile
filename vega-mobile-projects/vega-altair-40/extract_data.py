import json
import re

with open('original_visualization/desktop.html', 'r') as f:
    content = f.read()

# Find the spec object
spec_match = re.search(r'var spec = ({.*?});', content, re.DOTALL)
if spec_match:
    spec = json.loads(spec_match.group(1))
    datasets = spec.get('datasets', {})
    for name, data in datasets.items():
        with open('src/lib/data.json', 'w') as out:
            json.dump(data, out, indent=2)
        print(f"Extracted dataset {name} to src/lib/data.json")
else:
    print("Could not find spec object")
