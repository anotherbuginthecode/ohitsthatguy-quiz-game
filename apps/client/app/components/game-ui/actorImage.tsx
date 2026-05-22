import React from "react";

export default function ActorImage({
  imageUrl,
  fullname,
}: {
  imageUrl: string;
  fullname: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="w-48 h-56 overflow-hidden rounded-xl shadow-lg">
        <img
          src={`https://image.tmdb.org/t/p/w500${imageUrl}`}
          alt={fullname}
          width={192}
          height={224}
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div className="text-sm text-white font-semibold">{fullname}</div>
    </div>
  );
}
