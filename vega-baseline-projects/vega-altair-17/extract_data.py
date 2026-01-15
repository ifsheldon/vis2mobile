import json
import re

with open('original_visualization/desktop.html', 'r') as f:
    html_content = f.read()

# Use regex to find the spec object
spec_match = re.search(r'var spec = (\{.*?\});', html_content, re.DOTALL)
if spec_match:
    spec_json = spec_match.group(1)
    spec = json.loads(spec_json)
    
    with open('src/lib/data.json', 'w') as f:
        json.dump(spec, f, indent=2)
    print("Data extracted to src/lib/data.json")
else:
    print("Spec not found")
