import { Button } from "~/components/ui/button";
import { FaArrowLeft } from "react-icons/fa6";
import { Clock } from "lucide-react";
import { Progress } from "~/components/ui/progress";

export default function TopBar({
  round,
  totalRounds,
  timeLeft = 90,
  onBackClick,
}: {
  round: number;
  totalRounds: number;
  timeLeft: number;
  onBackClick: () => void;
}) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex p-4 text-white flex-col gap-5">
      <div className="flex items-center justify-between w-full">
        <Button aria-label="Back to home" onClick={onBackClick}>
          <FaArrowLeft aria-hidden="true" />
        </Button>
        <div className="font-bold ml-5" aria-live="polite" aria-atomic="true">
          {round} of {totalRounds}
        </div>
        <div>
          <Button
            className="px-5 flex gap-2"
            aria-label={`Time remaining: ${minutes} minutes ${seconds} seconds`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            {`${minutes}:${seconds}`}
          </Button>
        </div>
      </div>
      <div className="w-full">
        <Progress
          value={Math.round((round / totalRounds) * 100)}
          aria-label={`Round ${round} of ${totalRounds}`}
          aria-valuenow={round}
          aria-valuemin={1}
          aria-valuemax={totalRounds}
          className="h-2 bg-gray-200/20"
        />
      </div>
    </div>
  );
}
