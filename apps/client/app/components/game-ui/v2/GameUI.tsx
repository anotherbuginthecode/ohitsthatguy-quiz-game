import React, { useState, useEffect } from "react";
import TopBar from "./TopBar";
import StandardModePlaying from "./game-mode/StandardMode";
import { Button } from "~/components/ui/button";
import { calculatePoints } from "~/lib/score-calculator";
import { mockRounds } from "~/lib/mock";
import { BsSkipForwardFill } from "react-icons/bs";
import GameEnd from "./GameEnd";
import type { Round, ClassicRound } from "~/types/round.types";
import type { PickedAnswer } from "~/types/answer.types";
import { Badge } from "~/components/ui/badge";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import ClassicModePlaying from "./game-mode/ClassicMode";

export type GamePhase = "playing" | "roundEnd" | "gameEnd";

export default function GameUI({
  fetchedRounds,
  // secondChanceRound,
  gameUUID,
  onPlayAgain,
  totalRounds,
  totalTime,
  gameMode = null,
}: {
  fetchedRounds?: Round[] | any[];
  secondChanceRound?: Round | null;
  gameUUID?: string;
  totalRounds: number;
  totalTime: number;
  gameMode?: "classic" | "standard" | null;
  onPlayAgain: () => void;
}) {
  const { tracker } = useAnalytics();
  const basePoints = 100;
  const [secondChanceCounter, setSecondChanceCounter] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentActor, setCurrentActor] = useState(
    fetchedRounds ? fetchedRounds[0] : mockRounds[0]
  );
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pickedAnswer, setPickedAnswer] = useState<PickedAnswer[]>([]);
  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");

  const handleAnswer = (isCorrect: boolean) => {
    if (gameMode === null) return;
    if (gameMode === "standard") {
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
    }

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
      setTimeLeft((prev) =>
        gameMode === "standard" ? Math.max(prev - 3, 0) : Math.max(prev - 5, 0)
      );
    }
    setGamePhase("roundEnd");
  };

  // const handleSkip = () => {
  //   if (secondChanceCounter <= 0) return;
  //   if (currentRound < totalRounds) {
  //     sendAnalyticsEvent(tracker, "second_chance_used", {
  //       action: "second_chance_used",
  //       category: "engagement",
  //       label: "user used second chance",
  //       sessionid: localStorage.getItem("anonymousId") || "unknown",
  //       deviceuuid: localStorage.getItem("anonymous_device") || "unknown",
  //     });
  //     setTimeLeft((prev) => Math.max(prev - 10, 0));
  //     setSecondChanceCounter((prev) => Math.max(prev - 1, 0));
  //     setCurrentActor(
  //       secondChanceRound ? secondChanceRound : mockRounds[currentRound]
  //     );
  //   }
  //   if (timeLeft <= 5) {
  //     setTimeLeft(0);
  //     setGamePhase("roundEnd");
  //     return;
  //   }
  // };

  const handleNext = () => {
    if (currentRound < totalRounds) {
      sendAnalyticsEvent(tracker, "next_round", {
        action: "next_round",
        category: "engagement",
        label: "user proceeded to next round",
        sessionid: localStorage.getItem("anonymousId") || "unknown",
        deviceuuid: localStorage.getItem("anonymous_device") || "unknown",
      });

      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setCurrentActor(
        fetchedRounds ? fetchedRounds[nextRound - 1] : mockRounds[nextRound - 1]
      );
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
          {gamePhase !== "gameEnd" && gameMode === "standard" && (
            <StandardModePlaying
              score={score}
              onAnswer={(isCorrect) => handleAnswer(isCorrect)}
              round={currentActor}
            />
          )}
          {gamePhase !== "gameEnd" && gameMode === "classic" && (
            <ClassicModePlaying
              score={score}
              onAnswer={(isCorrect) => handleAnswer(isCorrect)}
              round={currentActor}
            />
          )}
          {gamePhase === "gameEnd" && (
            <GameEnd
              gameUUID={gameUUID}
              pickedAnswer={pickedAnswer}
              score={score}
              onPlayAgain={onPlayAgain}
              mode={gameMode || "standard"}
            />
          )}
        </div>
        {gamePhase !== "gameEnd" && (
          <div className="container px-2 flex items-center w-full justify-center">
            {/* {gamePhase === "playing" && (
              <Button
                className="text-white hover:bg-yellow-700 w-fit border border-yellow-300"
                onClick={handleSkip}
              >
                <span>
                  ⚡ Second Chance (-10s)
                  <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums bg-white text-gray-950 ml-2">
                    {secondChanceCounter}
                  </Badge>
                </span>
              </Button>
            )} */}
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

export function GameUIClassicMode() {
  return;
}
