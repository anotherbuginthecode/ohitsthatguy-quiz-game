import React from "react";
import ActorImage from "../../actorImage";
import { ActorsOption, Option } from "../Options";
import { useState, useEffect } from "react";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import type {
  ActorToMovieRound,
  MovieToActorRound,
  PopularityRound,
  ActorInMovieTFRound,
} from "~/types/round.types";

export type GameVariant =
  | "ACTOR_TO_MOVIE"
  | "MOVIE_TO_ACTOR"
  | "POPULARITY"
  | "ACTOR_IN_MOVIE_TF";

export function ACTOR_TO_MOVIE({
  round,
  onAnswer,
}: {
  round: ActorToMovieRound;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const { tracker } = useAnalytics();
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const onSelectOption = (title: string) => {
    sendAnalyticsEvent(tracker, "answer_selected", {
      action: "answer_selected",
      category: "engagement",
      label: title,
      game: "ACTOR_TO_MOVIE",
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
    <div>
      <div className="flex flex-col items-center space-y-4">
        <ActorImage imageUrl={round.actor.image} fullname={round.actor.name} />
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
    </div>
  );
}

export function MOVIE_TO_ACTOR({
  round,
  onAnswer,
}: {
  round: MovieToActorRound;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const { tracker } = useAnalytics();
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  const onSelectOption = (name: string) => {
    sendAnalyticsEvent(tracker, "answer_selected", {
      action: "answer_selected",
      category: "engagement",
      label: name,
      game: "MOVIE_TO_ACTOR",
      sessionid: localStorage.getItem("anonymousId") || "unknown",
      deviceuuid: localStorage.getItem("anonymous_device") || "unknown",
    });
    setSelectedActor(name);
    const isCorrect =
      round.choices.find((c) => c.name === name)?.tmdb_id === round.correctId;
    onAnswer(isCorrect);
  };

  const showCorrect = selectedActor !== null;

  useEffect(() => {
    setSelectedActor(null);
  }, [round]);
  return (
    <div>
      <div className="flex flex-col items-center space-y-4 text-2xl text-white">
        {round.title.name}
      </div>
      <div>
        <h2 className="text-sm font-bold text-center text-white mt-4">
          Which Actor Starred In This Movie?
        </h2>
        <div className="grid grid-cols-1 gap-5 mt-4">
          {round.choices.map((choice, index) => {
            const isSelected = selectedActor === choice.name;
            // Show correct if selected, otherwise only show selected
            const isCorrect = showCorrect && choice.tmdb_id === round.correctId;
            return (
              <ActorsOption
                key={index}
                name={choice.name}
                imageUrl={choice.image}
                onSelect={() => onSelectOption(choice.name)}
                isCorrect={isCorrect}
                isSelected={isSelected}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ACTOR_IN_MOVIE_TF({
  round,
  onAnswer,
}: {
  round: ActorInMovieTFRound;
  onAnswer: (isCorrect: boolean) => void;
}) {
  const { tracker } = useAnalytics();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const onSelectOption = (value: string) => {
    sendAnalyticsEvent(tracker, "answer_selected", {
      action: "answer_selected",
      category: "engagement",
      label: value,
      game: "ACTOR_IN_MOVIE_TF",
      sessionid: localStorage.getItem("anonymousId") || "unknown",
      deviceuuid: localStorage.getItem("anonymous_device") || "unknown",
    });
    setSelectedValue(value);
    const isCorrect =
      round.correctAnswer === value.toUpperCase() ? true : false;
    onAnswer(isCorrect);
  };

  const showCorrect = selectedValue !== null;

  useEffect(() => {
    setSelectedValue(null);
  }, [round]);
  return (
    <div>
      <div className="flex flex-col items-center space-y-4">
        <ActorImage imageUrl={round.actor.image} fullname={round.actor.name} />
      </div>
      <div>
        <h2 className="text-sm font-bold text-center text-white mt-4">
          Did {round.actor.name} Star In "{round.title.name}"?
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 mt-4">
        {["YES", "NO"].map((option, index) => {
          const isSelected = selectedValue === option.toUpperCase();
          // Show correct if selected, otherwise only show selected
          const isCorrect =
            showCorrect && round.correctAnswer === option.toUpperCase();
          return (
            <Option
              key={index}
              value={option}
              onSelect={() => onSelectOption(option.toUpperCase())}
              isCorrect={isCorrect}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
