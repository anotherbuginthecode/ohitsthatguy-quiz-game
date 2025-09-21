export interface Actor {
  id: string;
  name: string;
  age: number;
  movies: Movie[];
}

export interface Movie {
  tmdb_id: number;
  original_language: string;
  poster_path?: string | null;
  release_date: string;
  original_title: string;
  popularity: number;
}

export interface DatabaseConfig {
  uri: string;
  dbName: string;
}

export interface LambdaResponse {
  statusCode: number;
  body: string;
}

export interface LambdaEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string;
}
