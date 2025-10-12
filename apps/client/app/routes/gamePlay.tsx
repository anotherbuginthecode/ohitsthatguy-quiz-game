import { useState, useEffect, use } from "react";
import GameUI from "~/components/game-ui/v2/GameUI";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { fetchClassicGameset, fetchStandardGameset, postData } from "~/lib/api";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import GameModeSelection from "~/components/game-ui/v2/GameModeSelection";

export default function GamePlay() {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const { gameId } = useParams();
  const [fetchedRounds, setFetchedRounds] = useState([]);
  // const [secondChanceRound, setSecondChanceRound] = useState<Round | null>(
  //   null
  // );
  const [stepPhase, setStepPhase] = useState<"mode-selection" | "playing">(
    "mode-selection"
  );
  const [gameMode, setGameMode] = useState<"classic" | "standard" | null>(null);
  const [gameConfig, setGameConfig] = useState<{
    rounds: number;
    time: number;
  }>({
    rounds: 5,
    time: 60,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchRounds = async (mode: "classic" | "standard" | null) => {
    if (!mode) return;
    try {
      if (mode === "classic") {
        const res = await fetchClassicGameset();
        const data = res.data;
        setFetchedRounds(data.rounds);
      } else if (mode === "standard") {
        const res = await fetchStandardGameset();
        const data = res.data;
        setFetchedRounds(data.rounds);
      }
      setStepPhase("playing");
    } catch (error) {
      console.error("Failed to fetch game settings:", error);
    }
  };

  const handlePlayAgain = () => {
    fetchRounds(gameMode);
    window.scrollTo(0, 0);
    sendAnalyticsEvent(tracker, "play_again", {
      action: "play_again",
      category: "engagement",
      label: "user played again",
      sessionid: gameId,
    });

    const payload = {
      event: "play_again",
      sessionid: gameId,
      props: {
        timestamp: new Date().toISOString(),
      },
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Play Again clicked", payload);
    } else {
      postData("api/store/events", payload).catch((error) => {
        console.error("Failed to log play again event:", error);
      });
    }
  };

  useEffect(() => {
    if (gameMode) {
      fetchRounds(gameMode);
      if (gameMode === "classic") {
        setGameConfig({ rounds: 10, time: 60 });
      } else {
        setGameConfig({ rounds: 5, time: 30 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode]);

  return (
    <div className="">
      <div className="flex min-h-screen flex-col items-center px-5">
        <div className="w-full mt-5 h-full">
          {stepPhase === "mode-selection" ? (
            <GameModeSelection
              onSelectMode={(m: "classic" | "standard") => {
                setGameMode(m);
              }}
            />
          ) : (
            <GameUI
              key={Date.now()} // force remount on play again using timestamp
              fetchedRounds={fetchedRounds}
              // secondChanceRound={secondChanceRound}
              onPlayAgain={() => handlePlayAgain()}
              gameUUID={gameId}
              totalRounds={gameConfig.rounds}
              totalTime={gameConfig.time}
              gameMode={gameMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
