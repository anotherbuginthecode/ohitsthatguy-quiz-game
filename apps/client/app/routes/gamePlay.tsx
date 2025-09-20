import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import GameUI from "../components/game-ui/gameUI";
import { mockActorsENG, mockActorsITA } from "~/lib/mock";
import { trackNewGame } from "~/lib/ga-utils";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { use } from "react";

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
  const [actor, setActor] = useState<Actor | null>(null);

  function pickRandomActor() {
    // Mock data per il MVP - sostituire con API TMDB
    // const mockActors = language === "it" ? mockActorsITA : mockActorsENG;
    const mockActors = mockActorsENG;
    const randomIndex = Math.floor(Math.random() * mockActors.length);
    setActor(mockActors[randomIndex]);
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
    pickRandomActor();
  }

  useEffect(() => {
    tracker.trackPageView({});
  }, [location, tracker]);

  useEffect(() => {
    handleStart();
  }, []);

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
