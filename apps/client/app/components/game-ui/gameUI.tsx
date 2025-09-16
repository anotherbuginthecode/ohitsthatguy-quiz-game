import React, { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import RoundCounter from "./roundCounter";
import Score from "./Score";
import ActorImage from "./actorImage";
import { Input } from "~/components/ui/input";
import Timer from "./timer";
import Alert from "./alert";

export type GamePhase = "playing" | "roundEnd" | "gameEnd";
export type PickedActor = {
  name: string;
  image: string;
  movies: string[];
} | null;

export default function GameUI({
  pickedActor,
  totalRound,
  onRoundEnd,
  onGameEnd,
}: {
  pickedActor: PickedActor;
  totalRound: number;
  onRoundEnd?: () => void;
  onGameEnd?: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
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
      if (answeredMovies.includes(answer.trim())) {
        setAnswerStatus("repeated");
        setAnswer("");
        return;
      } else if (
        pickedActor &&
        pickedActor.movies.some(
          (movie) => movie.toLowerCase() === answer.trim().toLowerCase()
        )
      ) {
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

  // Timer countdown
  useEffect(() => {
    if (gamePhase === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gamePhase === "playing") {
      setGamePhase("playing");
      setTimeLeft(20);
      setAnswer("");
      setAnswerStatus(null);
      if (round >= totalRound) {
        setRound(1);
      } else {
        setRound((prev) => prev + 1);
      }
    }
  }, [timeLeft, gamePhase]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <RoundCounter currentRound={round} totalRound={totalRound} />
        <Score score={score} />
      </div>

      <Timer timeLeft={timeLeft} />

      <Card className={`bg-gray-950 border-0 shadow-none`}>
        <CardContent className="space-y-4 flex flex-col items-center">
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
            <span className="text-sm text-white/50">
              es. {pickedActor?.movies[0]}
            </span>
            {answeredMovies.length > 0 && (
              <div className="mt-2">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
