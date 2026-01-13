import json
import re
from bs4 import BeautifulSoup

def extract_data():
    with open('original_visualization/desktop.html', 'r') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    scripts = soup.find_all('script')

    for script in scripts:
        if script.string and 'var spec =' in script.string:
            # Extract the JSON string
            json_text = script.string.split('var spec =')[1].split('// vegaEmbed')[0].strip()
            # Remove trailing semicolon if present
            if json_text.endswith(';'):
                json_text = json_text[:-1]
            
            # Use regex to find the end of the JSON object if there's trailing garbage
            # A simple approach is to find the last '}'
            last_brace_index = json_text.rfind('}')
            if last_brace_index != -1:
                json_text = json_text[:last_brace_index+1]

            try:
                data = json.loads(json_text)
                
                # We need 'medians' and 'values' from datasets
                medians = data['datasets']['medians']
                values = data['datasets']['values']
                
                # Save to a new JSON file
                output = {
                    "medians": medians,
                    "values": values
                }
                
                with open('src/lib/data.json', 'w') as out_f:
                    json.dump(output, out_f, indent=2)
                
                print("Data extracted successfully to src/lib/data.json")
                return
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                print(f"Snippet: {json_text[:100]}...")

if __name__ == '__main__':
    extract_data()
