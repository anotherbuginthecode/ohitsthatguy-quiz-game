import { Title, Medium } from "./tmdb.types";

export interface DataAPI {
  getFilteredCredits(actorId: number): Promise<Title[]>; // cache
  getSimilar(t: Title, limit: number): Promise<Title[]>; // /similar
  getRecommendations(t: Title, limit: number): Promise<Title[]>; // /recommendations
  getTopCast(titleId: number, medium: Medium): Promise<number[]>; // person IDs
}
