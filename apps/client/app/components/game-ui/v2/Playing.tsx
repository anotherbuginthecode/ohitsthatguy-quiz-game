import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import ActorImage from "../actorImage";
import Option from "./Options";

type Round = {
  actor: {
    id: number;
    name: string;
    image: string;
  };
  choices: {
    title: string;
    isCorrect: boolean;
  }[];
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
    onAnswer(
      round.choices.find((choice) => choice.title === title)?.isCorrect || false
    );
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
            imageUrl={round.actor.image}
            fullname={round.actor.name}
          />
        </div>
        <div>
          <h2 className="text-sm font-bold text-center text-white mt-4">
            In Which Movie Did He Play This Character?
          </h2>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {round.choices.map((choice, index) => {
              const isSelected = selectedTitle === choice.title;
              // Show correct if selected, otherwise only show selected
              const isCorrect = showCorrect && choice.isCorrect;
              return (
                <Option
                  key={index}
                  value={choice.title}
                  onSelect={() => onSelectOption(choice.title)}
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
