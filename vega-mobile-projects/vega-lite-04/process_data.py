import pandas as pd
import json

# URL of the dataset
url = "https://vega.github.io/editor/data/movies.json"

try:
    df = pd.read_json(url)
    
    # Filter out null IMDB Ratings
    df = df[df['IMDB Rating'].notnull()]
    
    # Calculate Average Rating
    average_rating = df['IMDB Rating'].mean()
    print(f"Average IMDB Rating: {average_rating}")
    
    # Filter movies where (Rating - Average) > 2.5
    filtered_df = df[(df['IMDB Rating'] - average_rating) > 2.5].copy()
    
    # Select relevant columns
    result_df = filtered_df[['Title', 'IMDB Rating', 'Major Genre']]
    
    # Sort by Rating descending
    result_df = result_df.sort_values(by='IMDB Rating', ascending=False)
    
    print(f"Number of movies found: {len(result_df)}")
    
    # Convert to dictionary
    movies_data = result_df.to_dict(orient='records')
    
    output_data = {
        "averageRating": average_rating,
        "movies": movies_data
    }
    
    # Save to file or print for me to copy
    print(json.dumps(output_data, indent=2))
    
    # Save to a file for easy reading later if needed
    with open('processed_movies.json', 'w') as f:
        json.dump(output_data, f, indent=2)

except Exception as e:
    print(f"Error: {e}")
