import re
import json
import os
from datetime import datetime

def extract_data():
    input_path = 'original_visualization/desktop.html'
    output_path = 'src/data.json'

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the JSON object assigned to var spec
    match = re.search(r'var spec = ({.*});', content, re.DOTALL)
    if not match:
        print("Could not find spec data")
        return

    spec_str = match.group(1)
    
    # The regex might capture too much if there are other semicolons, but since it's the last script...
    # Actually, the file ends with the script. 
    # Let's try to be safer by finding the datasets part directly if parsing the whole spec is hard due to JS syntax quirks (though it looks like valid JSON)
    
    try:
        spec = json.loads(spec_str)
    except json.JSONDecodeError:
        # Fallback: try to extract just the datasets part
        print("Failed to parse full spec, trying to extract datasets...")
        match_data = re.search(r'"datasets":\s*({.*?"data-[^"]+":\s*\[.*?\]\s*})', content, re.DOTALL)
        if match_data:
            datasets_str = "{" + match_data.group(1) + "}" # wrap in braces if needed, wait, the regex captures the value of datasets
             # The regex above captures: { "data-id": [...] }
            # Wait, the regex needs to be careful about nesting.
            # Let's try a simpler approach: find the specific data array.
            pass
        
        # Let's rely on the first approach working or fix it if it fails.
        # The provided html shows `var spec = {"config": ...` which is valid JSON.
        # The only issue might be if there is trailing code inside the match.
        # re.search(r'var spec = ({.*});', ... ) might correspond to the last semicolon.
        # In the file, there is `vegaEmbed...` after `var spec = ...;`
        
        # Let's use a non-greedy match or match up to `};\s*vegaEmbed`
        match = re.search(r'var spec = ({.*?});\s*vegaEmbed', content, re.DOTALL)
        if match:
            spec_str = match.group(1)
            spec = json.loads(spec_str)
        else:
            print("Regex failed to isolate spec object.")
            return

    # Extract the data array
    # The key is dynamic: "data-7fb5cba8489b31900f8ac51a35bf2f48"
    datasets = spec.get('datasets', {})
    if not datasets:
        print("No datasets found in spec")
        return
    
    # Assume there's only one dataset or take the first one
    raw_data = list(datasets.values())[0]
    
    # Process data
    # Target: Array of { year: number, "Fossil Fuels": number, "Nuclear Energy": number, "Renewables": number }
    
    processed_data = {}
    
    for item in raw_data:
        # Parse year "2001-01-01T00:00:00"
        dt = datetime.fromisoformat(item['year'])
        year = dt.year
        source = item['source']
        net_gen = item['net_generation']
        
        if year not in processed_data:
            processed_data[year] = {"year": year}
        
        processed_data[year][source] = net_gen

    # Convert to list and sort by year
    final_data = sorted(processed_data.values(), key=lambda x: x['year'])
    
    # Ensure all keys are present for all years (fill with 0 if missing, though unlikely for this dataset)
    sources = set()
    for item in raw_data:
        sources.add(item['source'])
        
    for item in final_data:
        for source in sources:
            if source not in item:
                item[source] = 0

    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2)
    
    print(f"Data successfully extracted to {output_path}")

if __name__ == "__main__":
    extract_data()
