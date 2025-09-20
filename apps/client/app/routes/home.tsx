import { useEffect } from "react";
import HowItWorks from "~/components/HowItWorks";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { useLocation } from "react-router";
import HowToPlay from "~/components/HowToPlay";
import { FaGamepad } from "react-icons/fa";

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
    <div className="flex flex-col items-center justify-center h-full gap-10 rounded-xl backdrop-blur-xs px-10 lg:px-20">
      <div className="flex flex-col gap-5 text-center max-w-2xl">
        <h1 className="font-baloo-bold text-3xl">
          You’ve seen them before… where?
        </h1>
        <p className="font-baloo text-xl">Guess fast, climb the score!</p>
      </div>
      {/* <div className="w-full flex justify-center">
        <HowItWorks />
      </div> */}
      <div className="flex justify-center w-full">
        <Button
          className="cursor-pointer bg-yellow-300 text-gray-950 hover:bg-yellow-300 hover:text-white md:w-full xl:w-fit"
          onClick={() => {
            tracker.trackEvent("new_game", {
              action: "new_game",
              category: "engagement",
            });
          }}
        >
          <Link
            to={`/play/${uuidv4()}`}
            className="flex justify-center items-center gap-2 text-lg"
          >
            New Game <FaGamepad />
          </Link>
        </Button>
      </div>
      <div className="w-full flex justify-center">
        <HowToPlay />
      </div>
    </div>
  );
}
