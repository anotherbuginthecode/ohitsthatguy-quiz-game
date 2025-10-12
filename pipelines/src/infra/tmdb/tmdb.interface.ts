import { Title, Medium, Actor } from "./tmdb.types";

export interface DataAPI {
  // Actors and Movies
  getPerson(personId: number): Promise<Actor | null>;
  getPopularPeople(page?: number): Promise<Actor[]>;
  getFilteredCredits(actorId: number): Promise<Title[]>; // cache

  // Movies and similar
  getTitleDetails(id: number, medium: Medium): Promise<Title | null>;
  getSimilar(t: Title, limit: number): Promise<Title[]>; // /similar
  getRecommendations(t: Title, limit: number): Promise<Title[]>; // /recommendations

  // Cast
  getTopCast(
    titleId: number,
    medium: Medium,
    limit?: number
  ): Promise<number[]>; // person IDs
  getCastDetailed(
    titleId: number,
    medium: Medium,
    limit?: number
  ): Promise<Actor[]>; // per MOVIE_TO_ACTOR

  // Search utilities
  searchByGenreAndDecade(
    genres: number[],
    medium: Medium,
    year?: number,
    limit?: number
  ): Promise<Title[]>;
}
