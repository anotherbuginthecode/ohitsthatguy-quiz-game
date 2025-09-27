import { Button } from "~/components/ui/button";
import { FaArrowLeft } from "react-icons/fa6";
import { Progress } from "~/components/ui/progress";
import { Link } from "react-router";

export default function TopBar({
  round,
  totalRounds,
  timeLeft = 90,
}: {
  round: number;
  totalRounds: number;
  timeLeft: number;
}) {
  return (
    <div className="flex p-4 text-white flex-col gap-5">
      <div className="flex items-center justify-between w-full">
        <Button>
          <Link to="/">
            <FaArrowLeft />
          </Link>
        </Button>
        <div className="font-bold ml-5">
          {round} of {totalRounds}
        </div>
        <div>
          <Button className="px-5 flex gap-2">
            <span>⏰</span>
            {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
              .toString()
              .padStart(2, "0")}`}
          </Button>
        </div>
      </div>
      <div className="w-full">
        <Progress
          value={Math.round(((round === 1 ? 0.2 : round) / totalRounds) * 100)}
          className="h-2 bg-gray-200/20"
        />
      </div>
    </div>
  );
}
