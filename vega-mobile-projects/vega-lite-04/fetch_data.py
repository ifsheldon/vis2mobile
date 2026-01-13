import json
import requests

def fetch_and_process_data():
    url = "https://vega.github.io/editor/data/movies.json"
    response = requests.get(url)
    data = response.json()

    # 1. Filter out null ratings
    valid_movies = [m for m in data if m.get("IMDB Rating") is not None]

    # 2. Calculate mean
    total_rating = sum(m["IMDB Rating"] for m in valid_movies)
    count = len(valid_movies)
    average_rating = total_rating / count if count > 0 else 0

    # 3. Filter (datum['IMDB Rating'] - datum.AverageRating) > 2.5
    filtered_movies = [
        {
            "title": m["Title"],
            "rating": m["IMDB Rating"],
            "average_rating": average_rating
        }
        for m in valid_movies
        if (m["IMDB Rating"] - average_rating) > 2.5
    ]

    # Sort by title as per original or design plan
    filtered_movies.sort(key=lambda x: x["title"])

    result = {
        "average_rating": average_rating,
        "movies": filtered_movies
    }

    with open("src/lib/movies.json", "w") as f:
        json.dump(result, f, indent=2)

    print(f"Processed {len(filtered_movies)} movies. Global Average: {average_rating:.2f}")

if __name__ == "__main__":
    fetch_and_process_data()
