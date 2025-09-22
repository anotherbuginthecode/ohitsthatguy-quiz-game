import { FaUser } from "react-icons/fa";
import { FaFilm, FaTrophy, FaClock } from "react-icons/fa6";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "./ui/button";

export default function HowToPlay({ onStart }: { onStart: () => void }) {
  const instructions = [
    {
      icon: "🎬",
      title: "Type as many films as possible",
      description: "List all movies you know for the actor.",
    },
    {
      icon: "⌛",
      title: "30 Seconds",
      description: "Race against the clock!",
    },
    {
      icon: "👤",
      title: "3 Rounds, 3 Actors",
      description: "Each round features a new actor.",
    },

    {
      icon: "🏆",
      title: "Faster = More Points!",
      description: "Speed and accuracy boost your score.",
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/10 rounded-xl backdrop-blur-xl shadow-lg border-none px-5">
      <CardHeader className="pb-2">
        <CardTitle className="font-baloo-bold text-2xl text-white text-center">
          How to Play
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center text-base">
          Quick guide to the rules
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-2 py-0">
        {instructions.map((item, index) => (
          <div
            className="flex items-center gap-3 bg-background rounded-lg p-3 shadow-sm"
            key={index}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <span className="font-baloo-bold text-md text-foreground">
                {item.title}
              </span>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
      <div className="mt-4 text-center pb-4">
        <Button
          className="cursor-pointer bg-yellow-300 text-gray-950 hover:bg-yellow-300 hover:text-white md:w-full xl:w-fit text-lg"
          onClick={onStart}
        >
          Ready? Let’s play!
        </Button>
      </div>
    </Card>
  );
}
