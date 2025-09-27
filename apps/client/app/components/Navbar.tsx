import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="w-full p-4 text-white flex justify-end">
      <Button className="text-white hover:bg-yellow-400">Leaderboard</Button>
    </nav>
  );
}
