import json
import re

def extract_spec():
    with open('original_visualization/desktop.html', 'r') as f:
        content = f.read()
    
    match = re.search(r'var spec = (\{.*?\});', content, re.DOTALL)
    if match:
        spec_str = match.group(1)
        spec = json.loads(spec_str)
        
        # Extract the dataset
        datasets = spec.get('datasets', {})
        if datasets:
            # Usually there's only one dataset in this kind of spec
            data_name = spec.get('data', {}).get('name')
            if data_name and data_name in datasets:
                data = datasets[data_name]
                with open('src/lib/cars.json', 'w') as f_out:
                    json.dump(data, f_out, indent=2)
                print(f"Extracted {len(data)} rows to src/lib/cars.json")
            else:
                # If no data name, just take the first one
                first_data = list(datasets.values())[0]
                with open('src/lib/cars.json', 'w') as f_out:
                    json.dump(first_data, f_out, indent=2)
                print(f"Extracted {len(first_data)} rows to src/lib/cars.json")
        else:
            print("No datasets found in spec")
    else:
        print("Could not find spec in desktop.html")

if __name__ == "__main__":
    extract_spec()
