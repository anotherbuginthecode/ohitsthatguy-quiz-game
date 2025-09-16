import React from "react";
import { FaRegUser } from "react-icons/fa";

export default function RoundCounter({
  currentRound,
  totalRound,
}: {
  currentRound: number;
  totalRound: number;
}) {
  return (
    <div className="flex items-center space-x-2 bg-white px-5 py-1 rounded-md shadow-md">
      <FaRegUser className="text-gray-600" />
      <span className="font-bold text-gray-800">
        {currentRound} of {totalRound}
      </span>
    </div>
  );
}
