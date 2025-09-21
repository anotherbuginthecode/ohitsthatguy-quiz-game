import requests
import os
from dotenv import load_dotenv
from schema import Actor

load_dotenv()


headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + os.getenv("TMDB_API_KEY"),
}


def get_actor_tmdb_info(actor: str) -> Actor | None:
    url = f"https://api.themoviedb.org/3/search/person?query={actor.replace(' ', '%20')}&include_adult=false&language=en-US&page=1"

    response = requests.get(url, headers=headers)
    data = response.json()

    if results := data.get("results"):
        if first_result := results[0]:
            return {
                "tmdb_id": first_result.get("id"),
                "name": first_result.get("name"),
                "image": first_result.get("profile_path"),
                "movies": [],
            }

    return None


def get_list_all_movies_of_actor(tmdb_id: int) -> list[dict]:
    url = f"https://api.themoviedb.org/3/discover/movie?with_people={tmdb_id}&language=en-US"
    response = requests.get(url, headers=headers)
    data = response.json()

    movies = []
    for result in data.get("results", []):
        if result.get("original_language") in ("it", "en"):
            movies.append(
                {
                    "tmdb_id": result.get("id"),
                    "original_language": result.get("original_language"),
                    "poster_path": result.get("poster_path"),
                    "release_date": result.get("release_date"),
                    "original_title": result.get("original_title"),
                    "popularity": result.get("popularity"),
                }
            )
    return movies
