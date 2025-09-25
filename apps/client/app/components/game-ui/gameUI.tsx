import React, { act, use, useEffect, useState } from "react";
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
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { FaShuffle } from "react-icons/fa6";
import QuickFeedback from "./QuickFeedback";
import { BsSkipForwardFill } from "react-icons/bs";

import { postData } from "~/lib/api";

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
  onNextRound,
  onPlayAgain,
  onShuffleActor,
}: {
  pickedActor: PickedActor;
  totalRound: number;
  showHint: boolean;
  gameUUID?: string;
  onRoundEnd?: () => void;
  onNextRound?: () => void;
  onPlayAgain?: () => void;
  onShuffleActor?: () => void;
}) {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [shuffle, setShuffle] = useState(1);
  // Removed unused isRunning state
  const [answerStatus, setAnswerStatus] = useState<
    "correct" | "incorrect" | "repeated" | null
  >(null);
  const [round, setRound] = useState(1);
  const [gamePhase, setGamePhase] = useState<
    "playing" | "roundEnd" | "gameEnd"
  >("playing");
  const [answeredMovies, setAnsweredMovies] = useState<string[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Return") {
      sendAnalyticsEvent(tracker, "submit_answer", {
        action: "submit_answer",
        category: "engagement",
        label: `round_${round}`,
        sessionid: gameUUID,
      });
      e.preventDefault();
      checkAnswer();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    sendAnalyticsEvent(tracker, "submit_answer_btn", {
      action: "submit_answer",
      category: "engagement",
      label: `round_${round}`,
      sessionid: gameUUID,
    });
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

  const trackFeedback = (
    feedback: "yes" | "no",
    event: string = "round_feedback"
  ) => {
    sendAnalyticsEvent(tracker, event, {
      action: event,
      category: "engagement",
      label: feedback,
      round: round,
      actor: pickedActor?.name || "",
      sessionid: gameUUID,
    });

    const payload = {
      event: event,
      sessionid: gameUUID,
      props: {
        round: round,
        actor: pickedActor?.name || "",
        feedback: feedback,
      },
    };
    if (process.env.NODE_ENV === "development") {
      console.log("Feedback payload:", payload);
    } else {
      postData("api/store/events", payload).catch((error) => {
        console.error("Failed to send feedback:", error);
      });
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
      if (round >= totalRound) {
        setGamePhase("gameEnd");
        sendAnalyticsEvent(tracker, "end_game", {
          action: "end_game",
          category: "engagement",
          sessionid: gameUUID,
        });
        postData("api/store/events", {
          event: "end_game",
          sessionid: gameUUID,
          props: { score: score },
        }).catch((error) => {
          console.error("Failed to send game end event:", error);
        });
      } else {
        setGamePhase("roundEnd");
        onRoundEnd && onRoundEnd();
        const payload = {
          event: "round_end",
          sessionid: gameUUID,
          props: {
            round: round,
            actor: pickedActor?.name || "",
            score: score,
            points: points,
            answeredMovies: answeredMovies.length,
          },
        };
        if (process.env.NODE_ENV === "development") {
          console.log("Round end payload:", payload);
        } else {
          postData("api/store/events", payload).catch((error) => {
            console.error("Failed to send round end event:", error);
          });
        }
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
                    <div className="mt-2">
                      <Feedback
                        key={`feedback-correct-${Date.now()}`}
                        status="correct"
                        message={`+${points} points!`}
                      />
                    </div>
                  )}
                  {answerStatus === "incorrect" && (
                    <div className="mt-2">
                      <Feedback
                        key={`feedback-incorrect-${Date.now()}`}
                        status="incorrect"
                        message={`Incorrect`}
                      />
                    </div>
                  )}
                  {answerStatus === "repeated" && (
                    <div className="mt-2">
                      <Feedback
                        key={`feedback-repeated-${Date.now()}`}
                        status="repeated"
                        message={`Repeated`}
                      />
                    </div>
                  )}
                </div>
                {answeredMovies.length > 0 && (
                  <div className="text-left w-full">
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
                    placeholder="Type a movie title..."
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
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    className="text-sm bg-blue-500/20 hover:bg-blue-500/30 cursor-default"
                    onClick={() => {
                      if (shuffle <= 0) return;
                      setShuffle(shuffle - 1);
                      onShuffleActor && onShuffleActor();
                      setTimeLeft(30);
                      setAnsweredMovies([]);
                      setAnswerStatus(null);
                      setAnswer("");
                      sendAnalyticsEvent(tracker, "shuffle_actor", {
                        action: "shuffle_actor",
                        category: "engagement",
                        label: `round_${round}`,
                        actor: pickedActor?.name || "",
                      });
                    }}
                  >
                    <FaShuffle />
                    <span>Shuffle</span>
                    <div className="flex items-center justify-center bg-gray-500 rounded-xl w-4 h-4">
                      {shuffle}
                    </div>
                  </Button>
                  <Button
                    onClick={() => {
                      setTimeLeft(0);
                      setAnswerStatus(null);
                      setAnswer("");
                      sendAnalyticsEvent(tracker, "skip_round", {
                        action: "skip_round",
                        category: "engagement",
                        label: `round_${round}`,
                        actor: pickedActor?.name || "",
                        sessionid: gameUUID,
                      });
                      postData("api/store/events", {
                        event: "skip_round",
                        sessionid: gameUUID,
                        props: {
                          round: round,
                          actor: pickedActor?.name || "",
                        },
                      }).catch((error) => {
                        console.error(
                          "Failed to send skip round event:",
                          error
                        );
                      });
                    }}
                    className="hover:bg-red-500/30"
                  >
                    <BsSkipForwardFill />
                    <span>Skip</span>
                  </Button>
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
                <div className="flex justify-center">
                  <QuickFeedback
                    onFeedback={(feeback) => trackFeedback(feeback)}
                  />
                </div>
              </div>
            )}
            {gamePhase === "gameEnd" && (
              <>
                <div className="flex flex-col items-center gap-5 p-5 w-full overflow-y-scroll max-h-[70vh]">
                  {showSurvey ? (
                    <GiveAFeedbackBanner />
                  ) : (
                    <QuickFeedback
                      message="Did you enjoy the game?"
                      onFeedback={(feeback) => {
                        trackFeedback(feeback, "game_feedback");
                        setShowSurvey(true);
                      }}
                    />
                  )}
                  <div className="text-4xl text-white font-bold">Game End!</div>
                  <div className="text-2xl text-white flex items-center gap-2">
                    Your score:
                    <span className="text-3xl text-yellow-300 font-bold">
                      {score}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <Button
                      className="flex items-center gap-2 bg-yellow-300 text-gray-950 hover:bg-yellow-300 hover:text-white"
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
