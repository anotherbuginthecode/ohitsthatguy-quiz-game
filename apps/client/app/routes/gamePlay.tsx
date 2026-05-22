import { useState, useEffect } from "react";
import GameUI from "~/components/game-ui/v2/GameUI";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { fetchClassicGameset, fetchStandardGameset, postData } from "~/lib/api";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import GameModeSelection from "~/components/game-ui/v2/GameModeSelection";
import { Button } from "~/components/ui/button";

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-white">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-yellow-300 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-gray-400 text-sm">Loading your rounds…</p>
    </div>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-white text-center px-6">
      <p className="text-xl font-semibold">Something went wrong</p>
      <p className="text-gray-400 text-sm">
        We couldn't load the game rounds. Check your connection and try again.
      </p>
      <Button
        className="bg-yellow-300 hover:bg-yellow-400 text-gray-950 mt-2"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}

export default function GamePlay() {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const { gameId } = useParams();
  const [fetchedRounds, setFetchedRounds] = useState([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchRounds = async (mode: "classic" | "standard" | null) => {
    if (!mode) return;
    setIsLoading(true);
    setFetchError(false);
    try {
      if (mode === "classic") {
        const res = await fetchClassicGameset();
        setFetchedRounds(res.data.rounds);
      } else if (mode === "standard") {
        const res = await fetchStandardGameset();
        setFetchedRounds(res.data.rounds);
      }
      setStepPhase("playing");
    } catch (error) {
      console.error("Failed to fetch game settings:", error);
      setFetchError(true);
    } finally {
      setIsLoading(false);
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
    <div>
      <div className="flex min-h-screen flex-col items-center px-5">
        <div className="w-full mt-5 h-full">
          {isLoading && <LoadingScreen />}

          {fetchError && !isLoading && (
            <ErrorScreen onRetry={() => fetchRounds(gameMode)} />
          )}

          {!isLoading && !fetchError && stepPhase === "mode-selection" && (
            <GameModeSelection
              onSelectMode={(m: "classic" | "standard") => {
                setGameMode(m);
              }}
            />
          )}

          {!isLoading && !fetchError && stepPhase === "playing" && (
            <GameUI
              key={Date.now()}
              fetchedRounds={fetchedRounds}
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
