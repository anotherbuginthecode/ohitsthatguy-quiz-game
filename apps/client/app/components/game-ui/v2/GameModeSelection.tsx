import { useState, useEffect } from "react";
import GameLayout from "../GameLayout";
import { sendAnalyticsEvent } from "~/lib/ga-tracker";
import { useAnalytics } from "@keiko-app/react-google-analytics";
import { Link } from "react-router";
import { FaArrowLeft } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { Film, Clapperboard } from "lucide-react";

const gameModes = [
  {
    title: "Standard Edition",
    icon: <Film className="w-5 h-5" aria-hidden="true" />,
    description: "Play the classic actor-to-film quiz — 5 rounds.",
    mode: "standard" as const,
  },
  {
    title: "Director's Cut",
    icon: <Clapperboard className="w-5 h-5" aria-hidden="true" />,
    description:
      "Unlock the full cinematic experience — mixed question types, 10 rounds, higher difficulty.",
    mode: "classic" as const,
  },
];

export default function GameModeSelection({
  onSelectMode,
}: {
  onSelectMode: (mode: "classic" | "standard") => void;
}) {
  const { tracker } = useAnalytics();

  return (
    <div>
      <div className="py-5">
        <Button aria-label="Back to home">
          <Link to="/">
            <FaArrowLeft aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <GameLayout>
        <h1 className="text-3xl font-bold mb-6 text-center text-white max-sm:text-2xl">
          Choose Your Game Mode
        </h1>
        <div className="grid grid-cols-1 gap-6 w-full max-w-4xl text-white">
          {gameModes.map((mode) => (
            <button
              key={mode.mode}
              type="button"
              className="bg-gray-800/70 border border-gray-700 shadow-lg p-6 rounded-lg flex flex-col gap-2 hover:border-yellow-300 cursor-pointer transition text-left w-full"
              onClick={() => {
                sendAnalyticsEvent(tracker, "game_mode_selected", {
                  action: "game_mode_selected",
                  category: "engagement",
                  label: mode.mode,
                  sessionid: localStorage.getItem("anonymousId") || "unknown",
                  deviceuuid:
                    localStorage.getItem("anonymous_device") || "unknown",
                });
                onSelectMode(mode.mode);
              }}
            >
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  {mode.icon}
                  {mode.title}
                </h2>
                <p className="text-gray-300">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </GameLayout>
    </div>
  );
}
