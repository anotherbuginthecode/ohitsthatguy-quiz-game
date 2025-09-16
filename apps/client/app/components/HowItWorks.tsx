import React, { useState, useEffect } from "react";
import { MdOutlineTimer } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import GameUI from "./game-ui/gameUI";

export default function HowItWorks() {
  // Mock data per il MVP - sostituire con API TMDB
  const [pickedActor, setPickedActor] = useState<(typeof mockActors)[0] | null>(
    null
  );

  const mockActors = [
    {
      id: 1,
      name: "Leonardo DiCaprio",
      image: "https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg",
      movies: [
        "Inception",
        "Titanic",
        "The Wolf of Wall Street",
        "The Revenant",
        "Django Unchained",
        "Once Upon a Time in Hollywood",
        "Shutter Island",
        "Catch Me If You Can",
      ],
    },
    {
      id: 2,
      name: "Margot Robbie",
      image: "https://image.tmdb.org/t/p/w500/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
      movies: [
        "Barbie",
        "The Wolf of Wall Street",
        "Suicide Squad",
        "Once Upon a Time in Hollywood",
        "I, Tonya",
        "Birds of Prey",
        "Bombshell",
        "Amsterdam",
      ],
    },
    {
      id: 3,
      name: "Ryan Gosling",
      image: "https://image.tmdb.org/t/p/w500/lyUyVARQKhGxaxy0FbPJCQRpiaW.jpg",
      movies: [
        "La La Land",
        "Blade Runner 2049",
        "The Notebook",
        "Drive",
        "First Man",
        "The Big Short",
        "Crazy, Stupid, Love",
        "Barbie",
      ],
    },
  ];

  const pickRandomActor = () => {
    const randomIndex = Math.floor(Math.random() * mockActors.length);
    setPickedActor(mockActors[randomIndex]);
  };

  useEffect(() => {
    pickRandomActor();
  }, []);

  return (
    <div className="w-full max-w-2xl">
      <div className="mt-5 flex justify-center">
        <div className="flex justify-center flex-col items-center w-full">
          <div className="w-full">
            <GameUI pickedActor={pickedActor} totalRound={1} />
          </div>
          <div className="flex justify-between items-center w-full mt-4">
            <div className="flex justify-center flex-col items-center">
              <MdOutlineTimer size={32} className="text-amber-500" />
              <div className="text-center text-xs mt-2">20 seconds</div>
            </div>
            <div className="flex justify-center flex-col items-center mx-4">
              <FaTrophy size={32} className="text-amber-500" />
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
