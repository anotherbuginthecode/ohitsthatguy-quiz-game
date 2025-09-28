import { useState, useEffect, use } from "react";
import GameUI from "~/components/game-ui/v1/gameUI";
import GameUISingleChoice from "~/components/game-ui/v2/GameUI";
import { mockActorsENG, mockActorsITA } from "~/lib/mock";
import { useParams, useLocation } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { fetchData } from "~/lib/api";
import HowToPlay from "~/components/HowToPlayDialog";
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

  return (
    <div className="">
      <div className="flex min-h-screen flex-col items-center px-5">
        <div className="w-full mt-5">
          <GameUISingleChoice />
        </div>
      </div>
    </div>
  );
}
