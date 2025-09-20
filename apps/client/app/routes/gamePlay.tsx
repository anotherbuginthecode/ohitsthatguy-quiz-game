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

const LANGUAGES = [
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

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
  const [step, setStep] = useState(1);
  const [actor, setActor] = useState<Actor | null>(null);

  function pickRandomActor() {
    // Mock data per il MVP - sostituire con API TMDB
    const mockActors = language === "it" ? mockActorsITA : mockActorsENG;
    const randomIndex = Math.floor(Math.random() * mockActors.length);
    setActor(mockActors[randomIndex]);
  }

  function handleStart() {
    // TODO: Start the game logic, e.g., navigate to the next step or game screen
    pickRandomActor();
    setStep(2);
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

  return (
    <div className="container flex min-h-screen flex-col items-center p-10 gap-10">
      {step === 1 && (
        <Card className="max-w-md w-full bg-gray-950 border-0 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Start a New Game</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <div className="mb-2 font-medium">Select language</div>
              <div className="flex gap-4">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex-1 py-4 text-lg text-gray-950 bg-white hover:bg-amber-500 hover:text-white cursor-pointer ${
                      language === lang.code ? "bg-amber-500 text-white" : ""
                    }`}
                    aria-pressed={language === lang.code}
                  >
                    <span className="mr-2 text-2xl">{lang.flag}</span>
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 font-medium">Number of rounds</div>
              <Input
                type="number"
                min={1}
                max={20}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-24 bg-white text-gray-950"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleStart}
              disabled={!language || rounds < 1}
            >
              Start
            </Button>
          </CardFooter>
        </Card>
      )}
      {step === 2 && (
        <div className="w-full max-w-2xl">
          <GameUI
            gameUUID={gameId}
            totalRound={rounds}
            pickedActor={actor}
            showHint={false}
            onNextRound={handleNextRound}
          />
        </div>
      )}
    </div>
  );
}
