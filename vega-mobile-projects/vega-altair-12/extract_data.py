import pandas as pd
import requests
import json

def main():
    url = "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json"
    print(f"Fetching data from {url}...")
    response = requests.get(url)
    data = response.json()
    
    df = pd.DataFrame(data)
    
    # Filter entries where IMDB Rating is not null
    df = df[df['IMDB Rating'].notna()]
    
    # Sort by IMDB Rating descending
    df = df.sort_values(by='IMDB Rating', ascending=False)
    
    # Take top 10
    top_10 = df.head(10).copy()
    
    # Select relevant columns
    # The visualization usually needs Title and IMDB Rating.
    # We might also want to keep rank if we want to display it.
    result_data = []
    for i, row in enumerate(top_10.itertuples(), 1):
        result_data.append({
            "rank": i,
            "title": row.Title,
            "rating": row._6, # IMDB Rating column name might be mangled by pandas named tuples if it has space
            "votes": row._7   # IMDB Votes
        })
        
    # Wait, let's be safer with column access
    result_data = []
    for i, (_, row) in enumerate(top_10.iterrows(), 1):
        result_data.append({
            "rank": i,
            "title": row['Title'],
            "rating": row['IMDB Rating'],
            "votes": row['IMDB Votes']
        })

    print("Top 10 Movies:")
    print(json.dumps(result_data, indent=2))
    
    # Generate TypeScript file content
    ts_content = """export interface MovieData {
  rank: number;
  title: string;
  rating: number;
  votes: number;
}

export const data: MovieData[] = """ + json.dumps(result_data, indent=2) + ";\n"

    output_path = "src/lib/data.ts"
    with open(output_path, "w") as f:
        f.write(ts_content)
    
    print(f"Successfully wrote data to {output_path}")

if __name__ == "__main__":
    main()

