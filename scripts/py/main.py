from db import MongoDBClient
from schema import Actor, Movie
from tmdbapi import get_actor_tmdb_info, get_list_all_movies_of_actor
from actors import actors
import os


def run():
    mongo_uri = os.getenv("MONGODB_URI")
    mongo_db_name = os.getenv("MONGODB_DB_NAME")
    mongo_collection_name = os.getenv("MONGODB_COLLECTION_NAME")

    if not all([mongo_uri, mongo_db_name, mongo_collection_name]):
        raise ValueError("Missing MongoDB configuration in environment variables.")

    db_client = MongoDBClient(mongo_uri, mongo_db_name)
    print("Connected to MongoDB.")

    for actor_name in actors:
        print(f"Processing actor: {actor_name}")
        actor_info = get_actor_tmdb_info(actor_name)
        if actor_info:
            movies: Movie = get_list_all_movies_of_actor(actor_info["tmdb_id"])
            actor_info["movies"] = [movie for movie in movies]
            actor = Actor(**actor_info)
            inserted_id = db_client.add_document(mongo_collection_name, actor.dict())
            print(f"Inserted actor {actor.name} with ID: {inserted_id}")
        else:
            print(f"Actor {actor_name} not found in TMDB.")


if __name__ == "__main__":
    run()
