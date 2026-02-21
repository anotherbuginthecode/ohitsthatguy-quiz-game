import { Button } from "./ui/button";
import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav className="w-full p-4 text-white flex justify-end gap-5">
      <Button className="text-white hover:bg-yellow-400">
        <Link to="/leaderboard" className="flex items-center gap-2">
          <span className="text-xs">🏅</span> Leaderboard
        </Link>
      </Button>
      <Button className="text-white hover:bg-yellow-400">
        <Link to="/login" className="flex items-center gap-2">
          <span className="text-xs">👤</span> Login
        </Link>
      </Button>
    </nav>
  );
}
