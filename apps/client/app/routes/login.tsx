import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { useLocation } from "react-router";
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

export default function Login() {
  const location = useLocation();
  const { tracker } = useAnalytics();
  const [sessionid, setSessionid] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

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

  return <div>Login</div>;
}
