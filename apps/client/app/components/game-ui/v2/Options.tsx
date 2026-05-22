import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import ActorImage from "../actorImage";

export function Option({
  value,
  isCorrect,
  isSelected,
  onSelect,
  disabled,
}: {
  value: string;
  isCorrect?: boolean;
  isSelected?: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  let buttonClass =
    "w-full font-semibold py-2 px-4 rounded shadow flex items-center justify-between cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ";

  if (isCorrect) {
    buttonClass +=
      "bg-green-600/50 border border-green-500 hover:bg-green-500 text-white";
  } else if (isSelected) {
    buttonClass +=
      "bg-red-600/50 border border-red-600 hover:bg-red-500 text-white";
  } else {
    buttonClass += "bg-gray-200 hover:bg-gray-300 text-black";
  }

  return (
    <div>
      <button
        className={buttonClass}
        onClick={() => onSelect(value)}
        disabled={disabled}
      >
        <span className="max-sm:text-xs max-sm:p-2 text-md">{value}</span>
        {isCorrect ? (
          <FaCheckCircle className="ml-2 text-white" aria-hidden="true" />
        ) : isSelected ? (
          <MdCancel className="ml-2 text-white" aria-hidden="true" />
        ) : null}
      </button>
    </div>
  );
}

export function ActorsOption({
  name,
  imageUrl,
  isCorrect,
  isSelected,
  onSelect,
  disabled,
}: {
  name: string;
  imageUrl: string;
  isCorrect?: boolean;
  isSelected?: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  let buttonClass =
    "w-full font-semibold py-2 px-4 rounded shadow flex items-center justify-between cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70 ";

  if (isCorrect) {
    buttonClass +=
      "bg-green-600/50 border border-green-500 hover:bg-green-500 text-white";
  } else if (isSelected) {
    buttonClass +=
      "bg-red-600/50 border border-red-600 hover:bg-red-500 text-white";
  } else {
    buttonClass += "bg-gray-200 hover:bg-gray-300 text-black";
  }

  return (
    <div>
      <button
        className={buttonClass}
        onClick={() => onSelect(name)}
        disabled={disabled}
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16">
            <img
              src={`https://image.tmdb.org/t/p/w500${imageUrl}`}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full shadow-md"
            />
          </div>
          <div className="text-sm">{name}</div>
        </div>
        {isCorrect ? (
          <FaCheckCircle className="ml-2 text-white" aria-hidden="true" />
        ) : isSelected ? (
          <MdCancel className="ml-2 text-white" aria-hidden="true" />
        ) : null}
      </button>
    </div>
  );
}
