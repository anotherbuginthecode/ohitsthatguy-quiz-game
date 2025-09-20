import { useEffect } from "react";
import HowItWorks from "~/components/HowItWorks";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { useLocation } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Oh it's that guy!" },
    {
      name: "description",
      content:
        "A quiz game where users have to remember the highest number of times they saw an actor before the time ran out",
    },
  ];
}

export default function Home() {
  const location = useLocation();
  const { tracker } = useAnalytics();

  useEffect(() => {
    tracker.trackPageView({});
  }, [location, tracker]);

  return (
    <div className="flex min-h-screen items-center flex-col gap-10 px-10 py-5">
      <div>
        <p className="font-baloo-bold">
          Think you can match the face to the movies? Test your memory and see
          how many films you can remember before time's up!
        </p>
      </div>
      <div className="w-full flex justify-center">
        <HowItWorks />
      </div>
      <div className="flex justify-center w-full">
        <Button
          className="cursor-pointer bg-white text-gray-950 hover:bg-amber-500 hover:text-white"
          onClick={() => {
            tracker.trackEvent("new_game", {
              action: "new_game",
              category: "engagement",
            });
          }}
        >
          <Link to={`/play/${uuidv4()}`}>New Game 🎮</Link>
        </Button>
      </div>
    </div>
  );
}
