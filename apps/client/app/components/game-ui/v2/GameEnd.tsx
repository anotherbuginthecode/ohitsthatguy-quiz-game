import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import QuickFeedback from "~/components/QuickFeedback";
import { Button } from "~/components/ui/button";
import type { PickedAnswer } from "~/types/answer.types";
import { postData } from "~/lib/api";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";

export default function GameEnd({
  score = 0,
  pickedAnswer,
  gameUUID,
  onPlayAgain,
}: {
  score: number;
  pickedAnswer: PickedAnswer[];
  gameUUID?: string;
  onPlayAgain: () => void;
}) {
  const location = useLocation();
  const { tracker } = useAnalytics();

  const trackFeedback = (
    feedback: "yes" | "no",
    event: string = "round_feedback"
  ) => {
    sendAnalyticsEvent(tracker, event, {
      action: event,
      category: "engagement",
      label: feedback,
      round: pickedAnswer,
      sessionid: gameUUID,
    });

    const payload = {
      event: event,
      sessionid: gameUUID,
      props: {
        rounds: pickedAnswer,
        score: score,
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

  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4 flex flex-col items-center gap-5">
        <div className="text-center text-white font-semibold text-2xl">
          Game Over!
        </div>
        <div className="flex items-center text-yellow-300 gap-2 justify-center text-xl">
          <span>🏆</span>
          <span className="text-3xl font-bold">{score}</span>
        </div>
        <div>
          <div className="text-center text-white mb-2">Your Rounds</div>
          <div className="flex gap-3">
            {pickedAnswer.map((actor) => (
              <div className="relative" key={actor.tmdb_id}>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={`https://image.tmdb.org/t/p/w500${actor.image}`}
                  />
                  <AvatarFallback>{actor.name}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute inset-0 ${
                    actor.correct ? "bg-green-500" : "bg-red-500"
                  } opacity-40 rounded-full pointer-events-none`}
                />
              </div>
            ))}
          </div>
        </div>
        {/* <div className="text-center text-white">
          Thanks for playing! Share your score and challenge your friends!
        </div> */}
        <div className="flex flex-col items-center gap-3 text-center text-md text-white mt-4">
          <p>Your memory vs the clock… ready for revenge?</p>
          <Button
            className="border border-yellow-300 animate-pulse bg-yellow-300 hover:bg-yellow-700 text-gray-950 p-5"
            onClick={onPlayAgain}
          >
            🔥 Beat Your Score! 🔥
          </Button>
        </div>
        <div>
          <QuickFeedback
            message="Did you enjoy the game?"
            onFeedback={trackFeedback}
          />
        </div>
        {/* <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
          <Option label="Share on Twitter" bgColor="bg-blue-500 hover:bg-blue-600" />
          <Option label="Share on Facebook" bgColor="bg-blue-800 hover:bg-blue-900" />
          <Option label="Play Again" bgColor="bg-green-500 hover:bg-green-600" />
        </div> */}
      </CardContent>
    </Card>
  );
}
