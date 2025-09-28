import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import ActorImage from "../actorImage";
import Option from "./Options";

type Round = {
  actor: {
    tmdb_id: number;
    name: string;
    image: string;
  };
  correctId: number;
  choices: {
    id: number;
    name: string;
    original_language: string;
    medium: string;
    year: number;
    genres: number[];
    popularity: number;
  }[];
  meta: {
    totalTime: number;
    mode: string;
  };
};

export default function Playing({
  round,
  score = 0,
  onAnswer,
}: {
  round: Round;
  score: number;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const onSelectOption = (title: string) => {
    setSelectedTitle(title);
    const isCorrect =
      round.choices.find((c) => c.name === title)?.id === round.correctId;
    onAnswer(isCorrect);
  };

  const showCorrect = selectedTitle !== null;

  useEffect(() => {
    setSelectedTitle(null);
  }, [round]);

  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4">
        <div className="flex items-center mb-4 text-yellow-300 gap-2 justify-center">
          <span>🏆</span>
          <span className="text-xl font-bold">{score}</span>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <ActorImage
            imageUrl={`https://image.tmdb.org/t/p/w500${round.actor.image}`}
            fullname={round.actor.name}
          />
        </div>
        <div>
          <h2 className="text-sm font-bold text-center text-white mt-4">
            In Which Movie Did He Play This Character?
          </h2>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {round.choices.map((choice, index) => {
              const isSelected = selectedTitle === choice.name;
              // Show correct if selected, otherwise only show selected
              const isCorrect = showCorrect && choice.id === round.correctId;
              return (
                <Option
                  key={index}
                  value={choice.name}
                  onSelect={() => onSelectOption(choice.name)}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
