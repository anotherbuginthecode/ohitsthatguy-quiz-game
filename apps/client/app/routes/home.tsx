import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { useLocation } from "react-router";
import { FaGamepad } from "react-icons/fa";
import Logo from "~/assets/logo.png";
import { trackRetention, sendAnalyticsEvent } from "~/lib/ga-tracker";
import HowToPlayDialog from "~/components/HowToPlayDialog";
import { IoDocumentTextOutline } from "react-icons/io5";
import Navbar from "~/components/Navbar";

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
  const [sessionid, setSessionid] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    tracker.trackPageView({});
    const { anonymousId, deviceUUID } = trackRetention(tracker);
    setSessionid(anonymousId);
    setDeviceId(deviceUUID);
    sendAnalyticsEvent(tracker, "session_start", {
      action: "land_home",
      category: "engagement",
      sessionid:
        process.env.NODE_ENV === "development"
          ? "11111111-1111-1111-1111-111111111111"
          : anonymousId,
      deviceid: deviceUUID,
    });
  }, [location, tracker]);

  return (
    <div className="h-screen overflow-hidden">
      <div className="fixed top-5 z-50 right-5">
        <Navbar />
      </div>

      <div className="h-full flex items-center justify-center">
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
          <div className="flex justify-center w-full gap-4 ">
            <Button className="cursor-pointer bg-yellow-300 text-gray-950 hover:bg-yellow-300 hover:text-white w-fit">
              <Link
                to={`/play/${sessionid}`}
                className="flex justify-center items-center gap-2"
                onClick={() => {
                  sendAnalyticsEvent(tracker, "new_game", {
                    action: "new_game",
                    category: "engagement",
                    label: "user started a new game",
                    sessionid: sessionid,
                    deviceid: deviceId,
                  });
                }}
              >
                New Game <span className="ml-1">🎮</span>
              </Link>
            </Button>
            <HowToPlayDialog />
          </div>
          {/* Dialog */}
        </div>
      </div>
    </div>
  );
}
