import React from "react";

export default function ActorImage({
  imageUrl,
  fullname,
}: {
  imageUrl: string;
  fullname: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="w-32 h-32">
        <img
          src={`https://image.tmdb.org/t/p/w500${imageUrl}`}
          alt={fullname}
          className="w-full h-full object-cover rounded-full shadow-md"
        />
      </div>
      <div className="text-sm text-white">{fullname}</div>
    </div>
  );
}
