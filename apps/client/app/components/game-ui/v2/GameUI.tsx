import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import TopBar from "./TopBar";
import StandardModePlaying from "./game-mode/StandardMode";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { calculatePoints } from "~/lib/score-calculator";
import { mockRounds } from "~/lib/mock";
import GameEnd from "./GameEnd";
import type { Round, ClassicRound } from "~/types/round.types";
import type { PickedAnswer } from "~/types/answer.types";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import ClassicModePlaying from "./game-mode/ClassicMode";

export type GamePhase = "playing" | "roundEnd" | "gameEnd";

export default function GameUI({
  fetchedRounds,
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
  const navigate = useNavigate();
  const basePoints = 100;
  const [abandonOpen, setAbandonOpen] = useState(false);
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
          onBackClick={() => setAbandonOpen(true)}
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
            {gamePhase === "roundEnd" && (
              <Button
                className="bg-yellow-300 hover:bg-yellow-400 text-gray-950 w-2/3"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={abandonOpen} onOpenChange={setAbandonOpen}>
        <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Abandon game?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300 text-sm">
            Your current score will be lost. Are you sure you want to quit?
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800"
              onClick={() => setAbandonOpen(false)}
            >
              Keep playing
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => navigate("/")}
            >
              Abandon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
