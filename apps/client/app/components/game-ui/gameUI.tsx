// Checks if the answer is correct, repeated, or incorrect
export function checkMovieAnswer({
  answer,
  answeredMovies,
  pickedActor,
}: {
  answer: string;
  answeredMovies: string[];
  pickedActor: PickedActor;
}): "correct" | "incorrect" | "repeated" {
  if (answeredMovies.includes(answer.trim())) {
    return "repeated";
  }
  if (
    pickedActor &&
    pickedActor.movies.some((movie) => fuzzyMatch(movie, answer))
  ) {
    return "correct";
  }
  return "incorrect";
}
// Utility: Normalize string (remove punctuation, lowercase, trim)
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Utility: Fuzzy match (Levenshtein distance <= 2)
function fuzzyMatch(a: string, b: string): boolean {
  const s1 = normalize(a);
  const s2 = normalize(b);
  if (s1 === s2) return true;
  // Levenshtein distance
  const dp = Array(s1.length + 1)
    .fill(null)
    .map(() => Array(s2.length + 1).fill(0));
  for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
  for (let j = 0; j <= s2.length; j++) dp[0][j] = j;
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[s1.length][s2.length] <= 2;
}

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import RoundCounter from "./roundCounter";
import Score from "./Score";
import ActorImage from "./actorImage";
import { Input } from "~/components/ui/input";
import Timer from "./timer";
import Alert from "./alert";
import { Button } from "../ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdOutlineLoop } from "react-icons/md";
import { Link, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";

export type GamePhase = "playing" | "roundEnd" | "gameEnd";
export type PickedActor = {
  name: string;
  image: string;
  movies: string[];
} | null;

export default function GameUI({
  pickedActor,
  totalRound,
  showHint = false,
  isDemo = false,
  gameUUID,
  onRoundEnd,
  onGameEnd,
  onNextRound,
}: {
  pickedActor: PickedActor;
  totalRound: number;
  showHint: boolean;
  isDemo?: boolean;
  gameUUID?: string;
  onRoundEnd?: () => void;
  onGameEnd?: () => void;
  onNextRound?: () => void;
}) {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  // Removed unused isRunning state
  const [answerStatus, setAnswerStatus] = useState<
    "correct" | "incorrect" | "repeated" | null
  >(null);
  const [round, setRound] = useState(1);
  const [gamePhase, setGamePhase] = useState<
    "playing" | "roundEnd" | "gameEnd"
  >("playing");
  const [answeredMovies, setAnsweredMovies] = useState<string[]>([]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Return") {
      const result = checkMovieAnswer({
        answer,
        answeredMovies,
        pickedActor,
      });
      if (result === "repeated") {
        setAnswerStatus("repeated");
        setAnswer("");
        return;
      } else if (result === "correct") {
        setAnswerStatus("correct");
        const calcultedPoints = Math.max(1, Math.floor(timeLeft / 2));
        setPoints(calcultedPoints);
        setScore((prev) => prev + calcultedPoints);
        setAnsweredMovies((prev) => [...prev, answer.trim()]);
        setAnswer("");
        return;
      } else {
        setAnswerStatus("incorrect");
        setAnswer("");
        return;
      }
    }
  };

  const handleNextRound = () => {
    setRound((prev) => prev + 1);
    setGamePhase("playing");
    setAnsweredMovies([]);
    setAnswerStatus(null);
    setTimeLeft(30);
    onNextRound && onNextRound();
  };

  // Timer countdown
  useEffect(() => {
    if (gamePhase === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === "playing") {
      if (round >= totalRound) {
        if (!isDemo) {
          setGamePhase("gameEnd");
          onGameEnd && onGameEnd();
        } else {
          setGamePhase("roundEnd");
        }
      } else {
        setGamePhase("roundEnd");
        onRoundEnd && onRoundEnd();
      }
      setTimeLeft(20);
      setAnswer("");
      setAnswerStatus(null);
    }
  }, [timeLeft, gamePhase]);

  return (
    <div>
      {gamePhase !== "gameEnd" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <RoundCounter currentRound={round} totalRound={totalRound} />
            <Score score={score} />
          </div>

          <Timer timeLeft={timeLeft} />
        </>
      )}
      <Card className={`bg-gray-950 border-0 shadow-none`}>
        <CardContent className="space-y-4 flex flex-col items-center">
          {gamePhase === "playing" ? (
            <>
              {answerStatus === "correct" && (
                <Alert status="correct" message={`+${points} points!`} />
              )}
              {answerStatus === "incorrect" && (
                <Alert status="incorrect" message={`Incorrect`} />
              )}
              {answerStatus === "repeated" && (
                <Alert status="repeated" message={`Repeated`} />
              )}
              <div className="flex flex-col items-center text-center p-2">
                <ActorImage
                  fullname={pickedActor?.name || ""}
                  imageUrl={pickedActor?.image || ""}
                />
              </div>
              <div className="w-full">
                <Input
                  className="text-gray-950 bg-white"
                  onKeyDown={handleInputKeyDown}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                {showHint && (
                  <span className="text-sm text-white/50">
                    es. {pickedActor?.movies[0]}
                  </span>
                )}
              </div>
              {answeredMovies.length > 0 && (
                <div className="mt-2 text-left w-full">
                  <p className="text-sm text-white/50 mb-1">Answered:</p>
                  <div className="flex flex-wrap gap-2">
                    {answeredMovies.map((movie, index) => (
                      <span
                        key={index}
                        className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs"
                      >
                        {movie}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : gamePhase === "roundEnd" ? (
            <div className="flex flex-col gap-5 p-2">
              <div className="text-2xl text-white">
                Your score:{" "}
                <span className="text-3xl text-amber-500 font-bold">
                  {score}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-white/50 mb-1">Your answers:</p>
                {answeredMovies.map((movie, index) => (
                  <span
                    key={index}
                    className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs mr-2"
                  >
                    {movie}
                  </span>
                ))}
              </div>
              <div className="mt-2">
                <p className="text-sm text-white/50 mb-1">
                  Some films starring the actor:
                </p>
                <div className="flex flex-wrap gap-2">
                  {pickedActor?.movies.map((movie, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs"
                    >
                      {movie}
                    </span>
                  ))}
                </div>
              </div>
              {!isDemo && (
                <div className="flex items-center justify-end">
                  <Button
                    className="flex items-center gap-2"
                    onClick={handleNextRound}
                  >
                    Next round
                    <FaArrowRightLong />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 p-5">
              <div className="text-4xl text-white font-bold">Game End!</div>
              <div className="text-2xl text-white flex items-center gap-2">
                Your score:
                <span className="text-3xl text-amber-500 font-bold">
                  {score}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center">
                <Button
                  onClick={() => {
                    tracker.trackEvent("play_again", {
                      action: "play_again",
                      category: "engagement",
                      gameId: gameUUID,
                    });
                  }}
                >
                  <Link to={`/play/${gameUUID}`}>
                    <MdOutlineLoop />
                    Play Again!
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
