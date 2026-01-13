
import json

with open('extracted_data.json', 'r') as f:
    content = f.read().strip()

# Let's fix the JSON string more reliably
# It starts with {"data-....": [...]}
# It should end with a } but has extra garbage
# Find the last valid closing bracket
last_brace_index = content.rfind(']')
# The structure is { "key": [...] } so we need to go to the end of the object
content = content[:last_brace_index+1] + '}'

data = json.loads(content)
data_key = list(data.keys())[0]
daily_data = data[data_key]

monthly_agg = {}

for record in daily_data:
    date = record['date']
    month = int(date.split('-')[1])
    
    if month not in monthly_agg:
        monthly_agg[month] = {
            'min_temps': [],
            'max_temps': []
        }
    
    monthly_agg[month]['min_temps'].append(record['temp_min'])
    monthly_agg[month]['max_temps'].append(record['temp_max'])

final_data = []
month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

for month_num in sorted(monthly_agg.keys()):
    min_temp = min(monthly_agg[month_num]['min_temps'])
    max_temp = max(monthly_agg[month_num]['max_temps'])
    
    final_data.append({
        'month': month_names[month_num - 1],
        'minTemp': min_temp,
        'maxTemp': max_temp
    })

with open('data.json', 'w') as f:
    json.dump(final_data, f, indent=2)
