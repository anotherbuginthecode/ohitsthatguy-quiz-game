export type PickedAnswer = {
  tmdb_id: number;
  name: string;
  image: string;
  correct: boolean;
  mode: "standard" | "classic";
};
