import React, { useState, useEffect } from "react";
import { MdOutlineTimer } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import GameUI from "./game-ui/gameUI";
import { mockActorsENG } from "../lib/mock";

export default function HowItWorks() {
  // Mock data per il MVP - sostituire con API TMDB
  const [pickedActor, setPickedActor] = useState<
    (typeof mockActorsENG)[0] | null
  >(null);

  const pickRandomActor = () => {
    const randomIndex = Math.floor(Math.random() * mockActorsENG.length);
    setPickedActor(mockActorsENG[randomIndex]);
  };

  useEffect(() => {
    pickRandomActor();
  }, []);

  return (
    <div className="w-full max-w-2xl">
      <div className="mt-5 flex justify-center">
        <div className="flex justify-center flex-col items-center w-full">
          <div className="w-full">
            <GameUI
              pickedActor={pickedActor}
              totalRound={1}
              showHint={true}
              isDemo={true}
            />
          </div>
          <div className="flex justify-between items-center w-full mt-4">
            <div className="flex justify-center flex-col items-center">
              <MdOutlineTimer size={32} className="text-yellow-300" />
              <div className="text-center text-xs mt-2">30 seconds</div>
            </div>
            <div className="flex justify-center flex-col items-center mx-4">
              <FaTrophy size={32} className="text-yellow-300" />
              <div className="text-center text-xs mt-2">
                fast answer = more points!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
