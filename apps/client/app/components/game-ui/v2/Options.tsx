import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

export default function Option({
  value,
  isCorrect,
  isSelected,
  onSelect,
}: {
  value: string;
  isCorrect?: boolean;
  isSelected?: boolean;
  onSelect: (value: string) => void;
}) {
  let buttonClass =
    "w-full font-semibold py-2 px-4 rounded shadow flex items-center justify-between ";

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
      <button className={buttonClass} onClick={() => onSelect(value)}>
        <span className="max-sm:text-xs max-sm:p-2 text-md">{value}</span>
        {isCorrect ? (
          <FaCheckCircle className="ml-2 text-white" />
        ) : isSelected ? (
          <MdCancel className="ml-2 text-white" />
        ) : null}
      </button>
    </div>
  );
}
