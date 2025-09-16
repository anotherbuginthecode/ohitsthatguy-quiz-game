import { Progress } from "~/components/ui/progress";

import React from "react";

export default function Timer({ timeLeft }: { timeLeft: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-3xl font-bold text-amber-500">{timeLeft}s</div>
      </div>
      <Progress value={(timeLeft / 20) * 100} className="h-2 bg-gray-500" />
    </div>
  );
}
