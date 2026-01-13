import json
import re
from bs4 import BeautifulSoup

with open('original_visualization/desktop.html', 'r') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')
script_tags = soup.find_all('script')

# The data is in the last script tag. 
# The first 3 are just src references.
script_tag = script_tags[3]

script_content = script_tag.text

match = re.search(r'var spec = (.*?);', script_content, re.DOTALL)
if match:
    spec_str = match.group(1)
    spec = json.loads(spec_str)
    
    data = spec['datasets'][list(spec['datasets'].keys())[0]]

    with open('src/lib/data.json', 'w') as out:
        json.dump(data, out, indent=2)
    print("Data extracted to src/lib/data.json")
else:
    print("Could not find spec in html file")