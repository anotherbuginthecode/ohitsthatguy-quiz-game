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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import GiveAFeedbackBanner from "~/components/GiveAFeedbackBanner";

function ScoreTab({
  score = 0,
  pickedAnswer,
  gameUUID,
  mode,
  onPlayAgain,
}: {
  score: number;
  pickedAnswer: PickedAnswer[];
  gameUUID?: string;
  mode: "classic" | "standard";
  onPlayAgain: () => void;
}) {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const [showSurvey, setShowSurvey] = useState(false);
  const lastScore = localStorage.getItem(`lastscore_${mode}`) || "0";

  const trackFeedback = (
    feedback: "yes" | "no",
    event: string = "round_feedback"
  ) => {
    setShowSurvey(true);
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
    if (import.meta.env.DEV) {
      console.log("Feedback payload:", payload);
    } else {
      postData("api/store/events", payload).catch((error) => {
        console.error("Failed to send feedback:", error);
      });
    }
  };

  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4 flex flex-col items-center gap-2">
        <div className="text-center text-white font-semibold text-2xl">
          Game Over!
        </div>
        <div className="flex items-center text-yellow-300 gap-2 justify-center text-xl">
          <span>🏆</span>
          <span className="text-3xl font-bold">{score}</span>
        </div>
        <div className="text-white">(prev. score: {lastScore})</div>
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
        <div className="w-full flex flex-col items-center">
          {/* <QuickFeedback
            message="Did you enjoy the game?"
            onFeedback={(feeback) => trackFeedback(feeback, "game_feedback")}
          />
          {showSurvey && <GiveAFeedbackBanner />} */}

          <GiveAFeedbackBanner />
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardTab() {
  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4 flex flex-col gap-5">
        <div className="text-white flex flex-col gap-3 text-center items-center justify-center w-full">
          <p>
            I'm considering adding a global leaderboard where players can
            compare their scores with others.
          </p>
          <QuickFeedback
            message="Would you like to see a global leaderboard?"
            onFeedback={(feeback) => {
              if (import.meta.env.DEV) {
                console.log("Leaderboard feedback:", feeback);
                return;
              }
              postData("api/store/events", {
                event: "leaderboard_feedback",
                sessionid: localStorage.getItem("anonymousId") || crypto.randomUUID(),
                props: {
                  feedback: feeback,
                  timestamp: new Date().toISOString(),
                },
              }).catch((error) => {
                console.error("Failed to log leaderboard feedback:", error);
              });
            }}
          />
        </div>
        <div className="text-center text-white font-semibold text-2xl">
          Leaderboard Coming Soon!
        </div>
      </CardContent>
    </Card>
  );
}

function SocialTab() {
  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4 flex flex-col gap-5">
        <div className="text-white flex flex-col gap-3 text-center items-center justify-center">
          <p>
            I'm considering the option to let you share your score on social
            media (e.g. Reddit, Twitter) and challenge your friends to play the
            same round.
          </p>
          <QuickFeedback
            message="Would you find this feature useful or fun?"
            onFeedback={(feeback) => {
              if (import.meta.env.DEV) {
                console.log("Social feedback:", feeback);
                return;
              }
              postData("api/store/events", {
                event: "social_sharing_feedback",
                sessionid: localStorage.getItem("anonymousId") || crypto.randomUUID(),
                props: {
                  feeback: feeback,
                  timestamp: new Date().toISOString(),
                },
              }).catch((error) => {
                console.error("Failed to log social sharing feedback:", error);
              });
            }}
          />
        </div>
        <div className="text-center text-white font-semibold text-2xl">
          Social Sharing Coming Soon!
        </div>
      </CardContent>
    </Card>
  );
}

export default function GameEnd({
  score = 0,
  pickedAnswer,
  gameUUID,
  mode,
  onPlayAgain,
}: {
  score: number;
  pickedAnswer: PickedAnswer[];
  gameUUID?: string;
  mode: "classic" | "standard";
  onPlayAgain: () => void;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
    localStorage.setItem(`lastscore_${mode}`, score.toString());
  }, [score]);

  return (
    <div>
      <Tabs defaultValue="score">
        <TabsList className="justify-center bg-gray-700/50 border-b border-gray-600 text-white">
          <TabsTrigger value="score">🏆 Your Score</TabsTrigger>
          <TabsTrigger value="leaderboard">🏅 Leaderboard</TabsTrigger>
          <TabsTrigger value="social">📲 Social</TabsTrigger>
        </TabsList>
        <TabsContent value="score" className="mt-4">
          <ScoreTab
            score={score}
            pickedAnswer={pickedAnswer}
            gameUUID={gameUUID}
            onPlayAgain={onPlayAgain}
            mode={mode}
          />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-4">
          <div>
            <LeaderboardTab />
          </div>
        </TabsContent>
        <TabsContent value="social" className="mt-4">
          <div className="text-center text-white">
            <SocialTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
