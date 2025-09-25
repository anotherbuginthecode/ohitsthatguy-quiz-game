import { useState, useEffect, use } from "react";
import GameUI from "../components/game-ui/gameUI";
import { mockActorsENG, mockActorsITA } from "~/lib/mock";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { fetchData, postData } from "~/lib/api";
import HowToPlay from "~/components/HowToPlay";
import Header from "~/components/Header";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";

// const LANGUAGES = [
//   { code: "it", label: "Italiano", flag: "🇮🇹" },
//   { code: "en", label: "English", flag: "🇬🇧" },
// ];

type Actor = {
  id: number;
  name: string;
  image: string;
  movies: string[];
};

export default function GamePlay() {
  const location = useLocation();
  const { tracker } = useAnalytics();

  const { gameId } = useParams();
  const [language, setLanguage] = useState<string | null>(null);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [actor, setActor] = useState<Actor | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [steps, setSteps] = useState<"instructions" | "loading" | "playing">(
    "instructions"
  );

  function transformActorPayload(apiPayload: {
    tmdb_id: number;
    name: string;
    image: string;
    movies: { original_title: string }[];
  }): {
    id: number;
    name: string;
    image: string;
    movies: string[];
  } {
    return {
      id: apiPayload.tmdb_id,
      name: apiPayload.name,
      image: `https://image.tmdb.org/t/p/w500${apiPayload.image}`,
      movies: apiPayload.movies.map((movie) => movie.original_title),
    };
  }

  const fetchActors = async () => {
    if (process.env.NODE_ENV === "development") {
      const mockData = mockActorsENG;
      const shuffled = mockData.sort(() => 0.5 - Math.random());
      const actors = shuffled.slice(0, rounds);
      return actors;
    } else {
      const res = await fetchData(`api/actors`);
      const data = res.data;
      const actors = data.map(transformActorPayload);
      return actors;
    }
  };

  async function pickRandomActor() {
    if (process.env.NODE_ENV === "development") {
      const mockData = mockActorsENG;
      const shuffled = mockData.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, rounds);
      setActors(selected);
      return;
    }

    try {
      const actors = await fetchActors();
      setActors(actors);
    } catch (error) {
      console.error("Failed to fetch game settings:", error);
    }
  }

  const handleShuffleActors = async () => {
    const shuffledActors = await fetchActors();
    const randomActor =
      shuffledActors[Math.floor(Math.random() * shuffledActors.length)];
    setActor(randomActor);
  };

  function handleStart() {
    sendAnalyticsEvent(tracker, "start_game", {
      action: "start_game",
      category: "engagement",
      sessionid: gameId,
    });
    setSteps("loading");
    pickRandomActor();
  }

  function handleNextRound() {
    sendAnalyticsEvent(tracker, "next_round", {
      action: "next_round",
      category: "engagement",
      label: `round_${currentRound + 1}`,
      sessionid: gameId,
    });
    if (actors.length > 0) {
      setCurrentRound(currentRound + 1);
      const currentIndex = actors.findIndex((a) => a.id === actor?.id);
      const nextIndex = currentIndex + 1;
      if (nextIndex < actors.length) {
        setActor(actors[nextIndex]);
      }
    }
  }

  function handlePlayAgain() {
    sendAnalyticsEvent(tracker, "play_again", {
      action: "play_again",
      category: "engagement",
      sessionid: gameId,
    });
    setSteps("loading");
    pickRandomActor();
    setCurrentRound(1);
  }

  useEffect(() => {
    tracker.trackPageView({});
  }, [location, tracker]);

  useEffect(() => {
    if (actors.length > 0) {
      setActor(actors[0]);
      setSteps("playing");
    }
  }, [actors]);

  return (
    <div>
      <Header />

      <div className="flex min-h-screen flex-col items-center gap-10 px-5 justify-center">
        <div className="w-full max-w-2xl">
          {steps === "instructions" && (
            <HowToPlay onStart={() => handleStart()} />
          )}
          {steps === "loading" && (
            <div>
              <img
                src="https://tenor.com/view/launch-product-countdown-counting-gif-12478823.gif"
                alt="Loading..."
                className="h-32 mx-auto"
              />
            </div>
          )}
          {steps === "playing" && actor && (
            <GameUI
              gameUUID={gameId}
              totalRound={rounds}
              pickedActor={actor}
              showHint={false}
              onNextRound={handleNextRound}
              onPlayAgain={handlePlayAgain}
              onShuffleActor={handleShuffleActors}
            />
          )}
        </div>
      </div>
    </div>
  );
}
