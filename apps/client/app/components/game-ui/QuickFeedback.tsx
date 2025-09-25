import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function QuickFeedback({
  message = "Did you enjoy the round?",
  onFeedback,
}: {
  message?: string;
  onFeedback: (feedback: "yes" | "no") => void;
}) {
  const [feebackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null);

  const handleFeedback = (feedback: "yes" | "no") => {
    toast.success(
      `Thanks for your feedback: ${feedback === "yes" ? "👍 Yes" : "👎 No"}`,
      { position: "top-center" }
    );
    onFeedback(feedback);
    // Here you can also send the feedback to your backend or analytics service
  };

  return (
    <div className="p-4 max-w-xs text-center text-white">
      <h3>{message}</h3>
      <div className="mt-2 flex justify-center gap-4">
        {feebackGiven === null ? (
          <>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                setFeedbackGiven("yes");
                handleFeedback("yes");
              }}
            >
              👍 Yes
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                setFeedbackGiven("no");
                handleFeedback("no");
              }}
            >
              👎 No
            </Button>
          </>
        ) : feebackGiven === "yes" ? (
          <Button className="bg-green-500 text-white" disabled>
            👍 Yes
          </Button>
        ) : (
          <Button className="bg-red-500 text-white" disabled>
            👎 No
          </Button>
        )}
      </div>
    </div>
  );
}
