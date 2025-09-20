import { Progress } from "~/components/ui/progress";

import React from "react";

export default function Timer({ timeLeft }: { timeLeft: number }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-3xl font-bold text-yellow-300">{timeLeft}s</div>
        {/* <div>&nbsp;</div> */}
      </div>
      <Progress value={(timeLeft / 30) * 100} className="h-2 bg-gray-500" />
    </div>
  );
}
