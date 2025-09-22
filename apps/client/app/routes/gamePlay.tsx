import { useState, useEffect, use } from "react";
import GameUI from "../components/game-ui/gameUI";
import { mockActorsENG, mockActorsITA } from "~/lib/mock";
import { trackNewGame } from "~/lib/ga-utils";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { fetchData, postData } from "~/lib/api";

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

  async function pickRandomActor() {
    try {
      const res = await fetchData(`api/actors`);
      const data = res.data;
      const actors = data.map(transformActorPayload);
      setActors(actors);
    } catch (error) {
      console.error("Failed to fetch game settings:", error);
    }
  }

  async function storeGameSession() {
    try {
      const res = await postData(`api/sessions?game_uuid=${gameId}`, {});
      const data = res.data;
      console.log("Game session stored:", data);
    } catch (error) {
      console.error("Failed to store game session:", error);
    }
  }

  function handleStart() {
    pickRandomActor();
    trackNewGame(tracker, "new_game", {
      action: "new_game_started",
      category: "engagement",
      language: language,
      rounds: rounds,
      gameId: gameId,
    });
  }

  function handleNextRound() {
    if (actors.length > 0) {
      setCurrentRound(currentRound + 1);
      const currentIndex = actors.findIndex((a) => a.id === actor?.id);
      const nextIndex = currentIndex + 1;
      if (nextIndex < actors.length) {
        setActor(actors[nextIndex]);
      }
    }
  }

  useEffect(() => {
    tracker.trackPageView({});
  }, [location, tracker]);

  useEffect(() => {
    handleStart();
    storeGameSession();
  }, []);

  useEffect(() => {
    if (actors.length > 0) {
      setActor(actors[0]);
    }
  }, [actors]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-10 px-5">
      <div className="w-full max-w-2xl">
        <GameUI
          gameUUID={gameId}
          totalRound={rounds}
          pickedActor={actor}
          showHint={false}
          onNextRound={handleNextRound}
        />
      </div>
    </div>
  );
}
