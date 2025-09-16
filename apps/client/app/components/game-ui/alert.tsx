import { useEffect, useState } from "react";

export default function Alert({
  message,
  status,
}: {
  message: string;
  status: "correct" | "incorrect" | "repeated";
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, [message, status]);

  if (!visible) return null;

  return (
    <div className="text-center">
      <div
        className={`px-4 py-2 rounded shadow-md border ${
          status === "correct"
            ? "text-green-500 border-green-500"
            : status === "incorrect"
              ? "text-red-500 border-red-500"
              : "text-yellow-500 border-yellow-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
