import json
import re

with open('original_visualization/desktop.html', 'r') as f:
    content = f.read()

# Find the datasets part in the spec
# Look for "datasets": { and then match balanced braces
start_marker = '"datasets":'
start_idx = content.find(start_marker)
if start_idx != -1:
    # Find the first { after datasets
    brace_start = content.find('{', start_idx)
    if brace_start != -1:
        # Match balanced braces
        count = 0
        for i in range(brace_start, len(content)):
            if content[i] == '{':
                count += 1
            elif content[i] == '}':
                count -= 1
                if count == 0:
                    brace_end = i + 1
                    datasets_str = content[brace_start:brace_end]
                    datasets = json.loads(datasets_str)
                    data = list(datasets.values())[0]
                    with open('src/lib/data.json', 'w') as f:
                        json.dump(data, f)
                    print(f"Extracted {len(data)} data points to src/lib/data.json")
                    break
else:
    print("Could not find datasets in desktop.html")