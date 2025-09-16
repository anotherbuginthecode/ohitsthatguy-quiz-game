import HowItWorks from "~/components/HowItWorks";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { v4 as uuidv4 } from "uuid";

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
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10">
      <div>
        <h1 className="text-3xl font-bold">Oh it's that guy!</h1>
        <p className="mt-10">
          Think you recognize that face? Test your memory! Try to remember as
          many films as possible that each actor has appeared in before the
          clock runs out. Ready to play?
        </p>
      </div>
      <div className="w-full flex justify-center">
        <HowItWorks />
      </div>
      <div className="flex justify-center w-full">
        <Button className="cursor-pointer bg-white text-gray-950 hover:bg-amber-500 hover:text-white">
          <Link to={`/play/${uuidv4()}`}>New Game 🎮</Link>
        </Button>
      </div>
    </div>
  );
}
