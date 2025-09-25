import { useEffect, useState } from "react";
import HowItWorks from "~/components/HowItWorks";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { useLocation } from "react-router";
import { FaGamepad } from "react-icons/fa";
import Logo from "~/assets/logo.png";
import { trackRetention, sendAnalyticsEvent } from "~/lib/ga-tracker";

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
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    tracker.trackPageView({});
    const currentSessionUUID = trackRetention(tracker);
    setSessionId(currentSessionUUID);
    sendAnalyticsEvent(tracker, "session_start", {
      action: "land_home",
      category: "engagement",
      sessionid:
        process.env.NODE_ENV === "development"
          ? "11111111-1111-1111-1111-111111111111"
          : currentSessionUUID,
    });
  }, [location, tracker]);

  return (
    <div className="flex flex-col items-center justify-center gap-10 rounded-xl backdrop-blur-xs px-10 lg:px-20 h-full">
      <div>
        <img src={Logo} alt="Oh it's that guy!" className="h-32" />
      </div>
      <div className="flex flex-col gap-5 text-center max-w-2xl">
        <h1 className="font-baloo-bold text-3xl">
          You’ve seen the actor before… where?
        </h1>
        <p className="font-baloo text-xl">Guess fast, climb the score!</p>
      </div>
      {/* <div className="w-full flex justify-center">
        <HowItWorks />
      </div> */}
      <div className="flex justify-center w-full">
        <Button className="cursor-pointer bg-yellow-300 text-gray-950 hover:bg-yellow-300 hover:text-white w-fit">
          <Link
            to={`/play/${sessionId}`}
            className="flex justify-center items-center gap-2 text-lg"
            onClick={() => {
              sendAnalyticsEvent(tracker, "new_game", {
                action: "new_game",
                category: "engagement",
                sessionid: sessionId,
              });
            }}
          >
            New Game <FaGamepad />
          </Link>
        </Button>
      </div>
    </div>
  );
}
