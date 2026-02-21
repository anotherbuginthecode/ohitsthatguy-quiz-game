import { FaUser } from "react-icons/fa";
import { FaFilm, FaTrophy, FaClock } from "react-icons/fa6";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "../app/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default function HowToPlayV2({
  selectedVersion = "v2",
  onStart,
}: {
  selectedVersion: "v1" | "v2";
  onStart: () => void;
}) {
  const instructionsV2: {
    icon: string;
    title: string;
    description: string;
    badge?: string;
  }[] = [
    {
      icon: "🎬",
      title: "Guess the Right Movie",
      description: "Each actor comes with 3 movie titles — only 1 is correct!",
    },
    {
      icon: "⌛",
      title: "1 Minute Total",
      description: "You have 1 Minute to complete all rounds. Think fast!",
    },
    {
      icon: "👤",
      title: "5 Rounds, 5 Actors",
      description: "Every round brings a new face to challenge your memory.",
    },

    // {
    //   icon: "🔀",
    //   title: "Shuffle Option",
    //   description:
    //     "Can’t recognize the actor? Use shuffle to switch — but only a few times!",
    // },

    {
      icon: "🍿",
      title: "Faster = More Points!",
      description: "Speed and accuracy boost your score.",
    },
  ];

  const instructionsV1: {
    icon: string;
    title: string;
    description: string;
    badge?: string;
  }[] = [
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
      icon: "🔀",
      title: "Shuffle Option",
      description: "Can't recall? Shuffle to get a new actor (limited uses).",
      badge: "new",
    },

    {
      icon: "🍿",
      title: "Faster = More Points!",
      description: "Speed and accuracy boost your score.",
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/10 rounded-xl backdrop-blur-xl shadow-lg border-none px-5">
      <CardHeader className="pb-2">
        <CardTitle className="font-baloo-bold  text-white text-center max-sm:text-xl xl:text-2xl">
          How to Play
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center text-base">
          Quick guide to the rules
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-2 py-0">
        {(selectedVersion === "v2" ? instructionsV2 : instructionsV1).map(
          (item, index) => (
            <div
              className="flex items-center gap-3 bg-background rounded-lg max-sm:py-2 p-4  shadow-sm max-sm:text-xs xl:text-md"
              key={index}
            >
              <span className="">{item.icon}</span>
              <div>
                <span className="font-baloo-bold md:max-sm:text-xs xl:text-md text-foreground flex gap-2">
                  {item.title}{" "}
                  {item.badge && (
                    <Badge className="bg-yellow-300 text-gray-950">
                      {item.badge}
                    </Badge>
                  )}
                </span>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          )
        )}
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
