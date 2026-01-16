import json
import re

with open('original_visualization/desktop.html', 'r') as f:
    content = f.read()

match = re.search(r'var spec = ({.*?});', content, re.DOTALL)
if match:
    spec = json.loads(match.group(1))
    with open('penguin_data.json', 'w') as f:
        json.dump(spec['datasets'], f, indent=2)
    print("Data extracted to penguin_data.json")
else:
    print("Spec not found")
