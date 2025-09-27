import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export type PickedAnswer = {
  id: number;
  name: string;
  image: string;
  correct: boolean;
};

export default function GameEnd({
  score = 0,
  pickedAnswer,
}: {
  score: number;
  pickedAnswer: PickedAnswer[];
}) {
  return (
    <Card className="bg-gray-800/70 border border-gray-700 shadow-lg w-full mx-auto">
      <CardContent className="p-4 flex flex-col items-center gap-5">
        <div className="text-center text-white font-semibold text-2xl">
          Game Over!
        </div>
        <div className="flex items-center text-yellow-300 gap-2 justify-center text-xl">
          <span>🏆</span>
          <span className="text-3xl font-bold">{score}</span>
        </div>
        <div>
          <div className="text-center text-white mb-2">Your Rounds</div>
          <div className="flex gap-3">
            {pickedAnswer.map((actor) => (
              <div className="relative" key={actor.id}>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={actor.image} />
                  <AvatarFallback>{actor.name}</AvatarFallback>
                </Avatar>
                <div
                  className={`absolute inset-0 ${
                    actor.correct ? "bg-green-500" : "bg-red-500"
                  } opacity-40 rounded-full pointer-events-none`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="text-center text-white">
          Thanks for playing! Share your score and challenge your friends!
        </div>
        {/* <div className="flex flex-col md:flex-row gap-3 w-full justify-center">
          <Option label="Share on Twitter" bgColor="bg-blue-500 hover:bg-blue-600" />
          <Option label="Share on Facebook" bgColor="bg-blue-800 hover:bg-blue-900" />
          <Option label="Play Again" bgColor="bg-green-500 hover:bg-green-600" />
        </div> */}
      </CardContent>
    </Card>
  );
}
