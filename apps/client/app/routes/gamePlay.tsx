import { useState, useEffect, use } from "react";
import GameUISingleChoice from "~/components/game-ui/v2/GameUI";
import { mockActorsENG, mockActorsITA } from "~/lib/mock";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { fetchData, postData } from "~/lib/api";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";

export default function GamePlay() {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const { gameId } = useParams();
  const [fetchedRounds, setFetchedRounds] = useState([]);

  const fetchRounds = async () => {
    try {
      const res = await fetchData(`api/rounds`);
      const data = res.data;
      setFetchedRounds(data);
    } catch (error) {
      console.error("Failed to fetch game settings:", error);
    }
  };

  const handlePlayAgain = () => {
    fetchRounds();
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
    fetchRounds();
  }, [gameId]);

  const isLoading = fetchedRounds.length === 0;
  return (
    <div className="">
      <div className="flex min-h-screen flex-col items-center px-5">
        <div className="w-full mt-5 h-full">
          {isLoading ? (
            <div className="text-center text-lg flex justify-center items-center h-full w-full">
              <img
                src="https://tenor.com/view/stormcastle-count-down-movie-intro-gif-12190256.gif"
                alt="Content Description: a countdown to the number nine on a film strip"
              />
            </div>
          ) : (
            <GameUISingleChoice
              key={Date.now()} // force remount on play again using timestamp
              fetchedRounds={fetchedRounds}
              onPlayAgain={() => handlePlayAgain()}
              gameUUID={gameId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
