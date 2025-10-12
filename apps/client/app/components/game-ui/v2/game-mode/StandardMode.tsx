import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import ActorImage from "../../actorImage";
import { Option } from "../Options";
import type { Round } from "~/types/round.types";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { useAnalytics } from "@keiko-app/react-google-analytics";

export default function StandardModePlaying({
  round,
  score = 0,
  onAnswer,
}: {
  round: Round;
  score: number;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const { tracker } = useAnalytics();
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const onSelectOption = (title: string) => {
    sendAnalyticsEvent(tracker, "answer_selected", {
      action: "answer_selected",
      category: "engagement",
      label: title,
      sessionid: localStorage.getItem("anonymousId") || "unknown",
      deviceuuid: localStorage.getItem("anonymous_device") || "unknown",
    });
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
          <span>🍿</span>
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
            In Which Movie Did This Actor Star?
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
