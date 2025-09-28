import { useState } from "react";
import { toast } from "sonner";

export default function QuickFeedback({
  message = "Did you enjoy the round?",
  onFeedback,
}: {
  message?: string;
  onFeedback: (feedback: "yes" | "no") => void;
}) {
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);

  const handleFeedback = (feedback: "yes" | "no") => {
    toast.success(
      `Thanks for your feedback: ${feedback === "yes" ? "😊" : "😢"}`,
      { position: "top-center" }
    );
    onFeedback(feedback);
    setFeedbackGiven(feedback);
  };

  const baseBtn =
    "rounded-lg p-3 text-lg leading-none flex items-center justify-center focus:outline-none";

  return (
    <div className="p-4 max-w-md text-center text-white">
      <h3>{message}</h3>
      <div className="mt-2 flex justify-center gap-4">
        {feedbackGiven === null ? (
          <>
            <button
              className={`${baseBtn} bg-green-500 hover:bg-green-600`}
              onClick={() => handleFeedback("yes")}
            >
              <span role="img" aria-label="yes" className="block">
                😊
              </span>
            </button>
            <button
              className={`${baseBtn} bg-red-500 hover:bg-red-600`}
              onClick={() => handleFeedback("no")}
            >
              <span role="img" aria-label="no" className="block">
                😢
              </span>
            </button>
          </>
        ) : feedbackGiven === "yes" ? (
          <button className={`${baseBtn} bg-green-500`} disabled>
            <span role="img" aria-label="yes" className="block">
              😊
            </span>
          </button>
        ) : (
          <button className={`${baseBtn} bg-red-500`} disabled>
            <span role="img" aria-label="no" className="block">
              😢
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
