import React, { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import RoundCounter from "./roundCounter";
import Score from "./Score";
import ActorImage from "./actorImage";
import { Input } from "~/components/ui/input";
import Timer from "./timer";
import Feedback from "./feeback";
import { Button } from "../ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import { MdOutlineLoop } from "react-icons/md";
import { Link, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { isTitleMatch } from "~/lib/utils";
import GiveAFeedbackBanner from "../GiveAFeedbackBanner";

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
  gameUUID,
  onRoundEnd,
  onGameEnd,
  onNextRound,
  onPlayAgain,
}: {
  pickedActor: PickedActor;
  totalRound: number;
  showHint: boolean;
  gameUUID?: string;
  onRoundEnd?: () => void;
  onGameEnd?: () => void;
  onNextRound?: () => void;
  onPlayAgain?: () => void;
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
      e.preventDefault();
      checkAnswer();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkAnswer();
  };

  const checkAnswer = () => {
    let result = "";
    if (!answer.trim()) return;
    if (answeredMovies.includes(answer.trim())) {
      result = "repeated";
    } else {
      result = isTitleMatch(answer, pickedActor?.movies || [])
        ? "correct"
        : "incorrect";
    }
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
        setGamePhase("gameEnd");
        onGameEnd && onGameEnd();
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
    <div className="inset-5 flex items-center justify-center z-30">
      <div className="w-full">
        <Card className="bg-gray-950 border-0 shadow-none w-full xl:max-w-xl mx-auto">
          <CardContent className="flex flex-col items-center gap-4 py-6 px-2">
            {gamePhase !== "gameEnd" && (
              <>
                <div className="flex justify-between items-center w-full mb-2 px-5 xl:px-10">
                  <RoundCounter currentRound={round} totalRound={totalRound} />
                  <Score score={score} />
                </div>
              </>
            )}
            {gamePhase === "playing" && (
              <div className="px-5 w-full max-w-md flex flex-col items-center gap-5">
                <div className="flex flex-col items-center text-center">
                  <ActorImage
                    fullname={pickedActor?.name || ""}
                    imageUrl={pickedActor?.image || ""}
                  />

                  {answerStatus === "correct" && (
                    <div className="mt-5">
                      <Feedback
                        key={`feedback-correct-${Date.now()}`}
                        status="correct"
                        message={`+${points} points!`}
                      />
                    </div>
                  )}
                  {answerStatus === "incorrect" && (
                    <div className="mt-5">
                      <Feedback
                        key={`feedback-incorrect-${Date.now()}`}
                        status="incorrect"
                        message={`Incorrect`}
                      />
                    </div>
                  )}
                  {answerStatus === "repeated" && (
                    <div className="mt-5">
                      <Feedback
                        key={`feedback-repeated-${Date.now()}`}
                        status="repeated"
                        message={`Repeated`}
                      />
                    </div>
                  )}
                </div>
                {answeredMovies.length > 0 && (
                  <div className="mt-2 text-left w-full">
                    <p className="text-sm text-white/50 mb-1">Answered:</p>
                    <div className="flex flex-wrap gap-2">
                      {answeredMovies.map((movie, index) => (
                        <span
                          key={index}
                          className="bg-yellow-300 text-gray-950 px-2 py-1 rounded-full text-xs"
                        >
                          {movie}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="w-full max-w-md mx-auto flex items-center gap-2">
                  <Input
                    className="text-gray-950 bg-white w-full"
                    placeholder="🎬 Type a movie title..."
                    onKeyDown={handleInputKeyDown}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <div className="w-fit flex justify-center">
                    <Button
                      className="text-xl bg-green-500"
                      onClick={(e) => handleSubmit(e)}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
                <div className="w-full xl:max-w-xl px-10">
                  <Timer timeLeft={timeLeft} />
                </div>
              </div>
            )}
            {gamePhase === "roundEnd" && (
              <div className="flex flex-col gap-5 p-2 w-full overflow-y-scroll max-h-[70vh]">
                <div className="text-2xl text-white text-center">
                  Your score:{" "}
                  <span className="text-3xl text-yellow-300 font-bold">
                    {score}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-white/50 mb-1">Your answers:</p>
                  {answeredMovies.map((movie, index) => (
                    <span
                      key={index}
                      className="bg-yellow-300 text-gray-950 px-2 py-1 rounded-full text-xs mr-2"
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
                    {pickedActor?.movies
                      .sort(() => Math.random() - 0.5)
                      .slice(0, 10)
                      .map((movie, index) => (
                        <span
                          key={index}
                          className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs"
                        >
                          {movie}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    className="flex items-center gap-2"
                    onClick={handleNextRound}
                  >
                    Next round
                    <FaArrowRightLong />
                  </Button>
                </div>
              </div>
            )}
            {gamePhase === "gameEnd" && (
              <>
                <div className="flex flex-col items-center gap-5 p-5 w-full overflow-y-scroll max-h-[70vh]">
                  <GiveAFeedbackBanner />
                  <div className="text-4xl text-white font-bold">Game End!</div>
                  <div className="text-2xl text-white flex items-center gap-2">
                    Your score:
                    <span className="text-3xl text-yellow-300 font-bold">
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
                      <Link
                        to={`/play/${gameUUID}`}
                        className="flex items-center gap-2"
                        onClick={() => {
                          setScore(0);
                          setRound(1);
                          onPlayAgain && onPlayAgain();
                          setGamePhase("playing");
                          setAnsweredMovies([]);
                          setAnswerStatus(null);
                          setTimeLeft(30);
                        }}
                      >
                        <MdOutlineLoop />
                        Play Again!
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-5">
                    <ActorImage
                      fullname={pickedActor?.name || ""}
                      imageUrl={pickedActor?.image || ""}
                    />
                  </div>

                  <div className="mt-2 text-left w-full">
                    <p className="text-sm text-white/50 mb-1">Answered:</p>
                    <div className="flex flex-wrap gap-2">
                      {answeredMovies.map((movie, index) => (
                        <span
                          key={index}
                          className="bg-yellow-300 text-gray-950 px-2 py-1 rounded-full text-xs"
                        >
                          {movie}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-white/50 mb-1">
                      Some films starring the actor:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pickedActor?.movies
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 10)
                        .map((movie, index) => (
                          <span
                            key={index}
                            className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs"
                          >
                            {movie}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
