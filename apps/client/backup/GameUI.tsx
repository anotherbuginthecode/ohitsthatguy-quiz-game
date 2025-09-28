import React, { useState, useEffect } from "react";
import TopBar from "./TopBar";
import Playing from "./Playing";
import { Button } from "~/components/ui/button";
import { calculatePoints } from "~/lib/score-calculator";
import { mockRounds } from "~/lib/mock";
import { BsSkipForwardFill } from "react-icons/bs";
import GameEnd from "./GameEnd";

export type GamePhase = "playing" | "roundEnd" | "gameEnd";
export type PickedAnswer = {
  tmdb_id: number;
  name: string;
  image: string;
  correct: boolean;
  mode: "standard" | "express";
};

export default function GameUISingleChoice() {
  const totalRounds = 5;
  const basePoints = 100;
  const totalTime = 90;
  const [currentRound, setCurrentRound] = useState(1);
  const [currentActor, setCurrentActor] = useState(mockRounds[0]);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pickedAnswer, setPickedAnswer] = useState<PickedAnswer[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");

  const handleAnswer = (isCorrect: boolean) => {
    setPickedAnswer([
      ...pickedAnswer,
      {
        tmdb_id: currentActor.actor.tmdb_id,
        name: currentActor.actor.name,
        image: currentActor.actor.image,
        correct: isCorrect,
        mode: "standard",
      },
    ]);
    // Here you can also send the answer to your backend or analytics service
    if (isCorrect) {
      const { points, streak } = calculatePoints(
        isCorrect,
        timeLeft,
        {
          base: basePoints,
          totalTime: totalTime,
        },
        currentStreak
      );
      setScore(score + points);
      setCurrentStreak(currentStreak + 1);
    } else {
      setCurrentStreak(0);
    }
    setGamePhase("roundEnd");
  };

  const handleSkip = () => {
    setTimeLeft((prev) => Math.max(prev - 5, 0));
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setCurrentActor(mockRounds[currentRound]); // assuming mockRounds is 0-indexed
      setGamePhase("roundEnd");
    } else {
      setGamePhase("gameEnd");
    }
    if (timeLeft <= 5) {
      setTimeLeft(0);
      setGamePhase("roundEnd");
      return;
    }
  };

  const handleNext = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setCurrentActor(mockRounds[currentRound]);
      setGamePhase("playing");
    } else {
      setGamePhase("gameEnd");
    }
  };

  useEffect(() => {
    if (gamePhase !== "playing") return;
    if (timeLeft === 0) {
      setGamePhase("gameEnd");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  return (
    <div className="min-h-screen text-white flex flex-col container mx-auto gap-5 items-center mb-5">
      <div className="flex flex-col gap-5 w-full max-w-xl">
        <TopBar
          round={currentRound}
          totalRounds={totalRounds}
          timeLeft={timeLeft}
        />
        <div className="container px-2">
          {gamePhase !== "gameEnd" && (
            <Playing
              score={score}
              onAnswer={(isCorrect) => handleAnswer(isCorrect)}
              round={currentActor}
            />
          )}
          {gamePhase === "gameEnd" && (
            <GameEnd pickedAnswer={pickedAnswer} score={score} />
          )}
        </div>
        {gamePhase !== "gameEnd" && (
          <div className="container px-2 flex items-center w-full justify-center">
            {gamePhase === "playing" && (
              <Button
                className="bg-yellow-300 hover:bg-yellow-700 text-gray-950 w-2/3"
                onClick={handleSkip}
              >
                <BsSkipForwardFill className="mr-2" />
                <span>Skip (-5s)</span>
              </Button>
            )}
            {gamePhase === "roundEnd" && (
              <Button
                className="bg-yellow-300 hover:bg-green-700 text-gray-950 w-2/3"
                onClick={handleNext}
              >
                <span>Next</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
