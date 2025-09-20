import { FaUser } from "react-icons/fa";
import { FaFilm, FaTrophy } from "react-icons/fa6";

export default function HowToPlay() {
  return (
    <div className="max-w-2xl text-center flex flex-col gap-5">
      <h2 className="font-baloo text-xl mb-4">How to Play</h2>
      <div className="grid grid-cols-3 gap-10">
        <div>
          <FaUser className="mx-auto mb-2 text-4xl" />
          <h3 className="font-baloo-semibold text-sm mb-1">See the actor</h3>
        </div>
        <div>
          <FaFilm className="mx-auto mb-2 text-4xl" />
          <h3 className="font-baloo-semibold text-sm mb-1">Type the movie</h3>
        </div>
        <div>
          <FaTrophy className="mx-auto mb-2 text-4xl" />
          <h3 className="font-baloo-semibold text-sm mb-1">
            Score points fast
          </h3>
        </div>
      </div>
    </div>
  );
}
