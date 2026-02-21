import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { useLocation } from "react-router";
import Logo from "~/assets/logo.png";
import { trackRetention, sendAnalyticsEvent } from "~/lib/ga-tracker";
import GameLayout from "~/components/game-ui/GameLayout";
import Avatar from "~/components/Avatar";

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

export default function Leaderboard() {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const [sessionid, setSessionid] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    tracker.trackPageView({});
    const { anonymousId, deviceUUID } = trackRetention(tracker);
    setSessionid(anonymousId);
    setDeviceId(deviceUUID);
    sendAnalyticsEvent(tracker, "leaderboard", {
      action: "view",
      category: "engagement",
      sessionid:
        process.env.NODE_ENV === "development"
          ? "11111111-1111-1111-1111-111111111111"
          : anonymousId,
      deviceid: deviceUUID,
    });
  }, [location, tracker]);

  return (
    <div className="flex flex-col overflow-hidden h-screen">
      <div>
        <Link to="/">
          <img src={Logo} alt="Oh it's that guy!" className="h-12 m-5" />
        </Link>
      </div>
      <GameLayout>
        <div className="text-white">
          <h1 className="text-2xl font-baloo-bold mb-5 text-center">
            🏅 Leaderboard
          </h1>
          <div className="overflow-y-auto max-h-[60vh] pr-2">
            <ul>
              {leaderboardData.map((entry, index) => (
                <li
                  key={index}
                  className="flex justify-between p-3 bg-gray-800 rounded mb-2 items-center"
                >
                  <div className="flex items-center gap-5">
                    <Avatar />
                    <span>
                      {index + 1}. {entry.username}
                    </span>
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-right">🍿 {entry.score} pts</span>
                    <span className="text-xs text-white/30">
                      Last Game: {entry.last_game}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button className="mt-5 bg-yellow-300 text-gray-950 hover:bg-yellow-300 hover:text-white w-fit">
          <Link to="/" className="flex items-center gap-2">
            ← Back to Home
          </Link>
        </Button>
      </GameLayout>
    </div>
  );
}
