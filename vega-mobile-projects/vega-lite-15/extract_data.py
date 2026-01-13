import pandas as pd
import json

url = "https://vega.github.io/editor/data/stocks.csv"

try:
    df = pd.read_csv(url)
    df['date'] = pd.to_datetime(df['date'])
    
    # Pivot the table
    pivot_df = df.pivot(index='date', columns='symbol', values='price')
    
    # Resample to weekly mean to smooth and reduce data points
    # This makes the chart less jittery on mobile and lighter to render
    pivot_df = pivot_df.resample('W').mean().reset_index()
    
    # Round prices to 2 decimal places
    pivot_df = pivot_df.round(2)
    
    # Format date as string
    pivot_df['date'] = pivot_df['date'].dt.strftime('%Y-%m-%d')
    
    # Convert to list of dicts
    data = pivot_df.to_dict(orient='records')
    
    # Filter out any records where all values are null (optional)
    data = [d for d in data if any(v is not None for k, v in d.items() if k != 'date')]

    # Create TypeScript content
    ts_content = f"export type StockDataPoint = {{\n  date: string;\n  AAPL?: number;\n  AMZN?: number;\n  GOOG?: number;\n  IBM?: number;\n  MSFT?: number;\n}};\n\nexport const stockData: StockDataPoint[] = {json.dumps(data, indent=2)};\n"
    
    with open('src/lib/stockData.ts', 'w') as f:
        f.write(ts_content)
        
    print(f"Successfully processed {len(data)} records and saved to src/lib/stockData.ts")

except Exception as e:
    print(f"Error: {e}")
