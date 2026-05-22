import { Card, CardContent } from "~/components/ui/card";
import { Zap } from "lucide-react";
import {
  ACTOR_TO_MOVIE,
  MOVIE_TO_ACTOR,
  ACTOR_IN_MOVIE_TF,
} from "./GameVariants";
import type { ClassicRound } from "~/types/round.types";

export default function ClassicModePlaying({
  round,
  score = 0,
  onAnswer,
}: {
  round: ClassicRound;
  score: number;
  onAnswer: (isCorrect: boolean) => void;
}) {
  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center mb-4 text-yellow-300 gap-2 justify-center">
          <Zap className="w-5 h-5" aria-hidden="true" />
          <span className="text-xl font-bold tabular-nums">{score}</span>
        </div>

        {round && round.type === "ACTOR_TO_MOVIE" && (
          <ACTOR_TO_MOVIE round={round} onAnswer={onAnswer} />
        )}
        {round && round.type === "MOVIE_TO_ACTOR" && (
          <MOVIE_TO_ACTOR round={round} onAnswer={onAnswer} />
        )}
        {round && round.type === "ACTOR_IN_MOVIE_TF" && (
          <ACTOR_IN_MOVIE_TF round={round} onAnswer={onAnswer} />
        )}
      </CardContent>
    </Card>
  );
}
