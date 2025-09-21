from pydantic import BaseModel
from typing import List


class Movie(BaseModel):
    tmdb_id: int
    original_language: str
    poster_path: str | None
    release_date: str
    original_title: str
    popularity: float


class Actor(BaseModel):
    tmdb_id: int
    name: str
    image: str
    movies: List[Movie]
