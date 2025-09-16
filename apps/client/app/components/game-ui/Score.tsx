import React, { useEffect, useState } from "react";

export default function Score({ score }: { score: number }) {
  const [scoreChanged, setScoreChanged] = useState(false);
  useEffect(() => {
    if (score > 0) {
      setScoreChanged(true);
      const timer = setTimeout(() => {
        setScoreChanged(false);
      }, 800); // Duration of the highlight effect
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="">
      <p className="text-2xl">
        Score:{" "}
        <span
          className={`text-amber-500 ${scoreChanged ? "animate-ping text-green-500" : ""}`}
        >
          {score}
        </span>
      </p>
    </div>
  );
}
